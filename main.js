( function() {
  
  var vm = new Vue({
    el: document.querySelector('#mount'),
	    	data: {
	    	   posts: [],
	    	   total_page:null,
	    	   total_posts:null,
	    	   posts_per_page:null,
	    	   current_page:null,
			   colors: ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#ff0066', '#FF7F00', '#FF0000'],
			   imagesCount: 0,
			   imageCounter: 0,
			   ready: false,
				searchOpened: false,
				searchValue: ''
	    	},
		  updated () {
		  },
		  computed: {
			  searchedPosts () {
					  if(this.searchValue !== ''){
					  return this.posts.filter((post)=>{
						return this.searchValue.toLowerCase().split(' ').every(v => post.title.rendered.toLowerCase().includes(v)) || this.searchValue.toLowerCase().split(' ').every(v => post._embedded.author[0].name.toLowerCase().includes(v))
					  })
					  }else{
						return this.posts;
					  }
					}
		  },
	    	methods:{
				getPostImage(img) {
					if (img.mime_type === 'image/gif') {
						return img.source_url
					}
				return img.media_details.sizes.thumbnail.source_url	
				},
				shuffleItems () {
				  for(let i = this.posts.length - 1; i > 0; i--) {
					let randomIndex = Math.floor(Math.random() * i);

					let temp = this.posts[i];
					Vue.set(this.posts, i, this.posts[randomIndex]);
					Vue.set(this.posts, randomIndex, temp);
				  }
				},
				getTranslation (p) {
					if (p.translation) {
						return p.translation;
					}
					let translation = 'translate(' + this.getRandomInt(-15, 15) + 'px,' + this.getRandomInt(-15, 15) + 'px) !important';
					p.translation = translation;
					return translation;
				},
				getFlexGrow (p) {
					return '0';
					if (p.id % 2) {
						console.log('grow')
					} else {
						console.log('small')
					}
					if (p.id % 2) {
						return '0'
					} else {
						return '1'
					}
				},
				getColor (p) {
					if (p.color) {
						return p.color;
					}
					let color = this.colors[this.getRandomInt(0, this.colors.length)] + ' !important';
					p.color = color;
					return color;
				},
				getRandomInt (min, max) {
				  min = Math.ceil(min);
				  max = Math.floor(max);
				  return Math.floor(Math.random() * (max - min)) + min;
				},
	    		handleScroll (event) {
	    			// console.log(window.scrollY );
	    			// 
	    			//     function scrollHorizontally(e) {
					e = window.event || e;
					var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
					document.getElementById('posts').scrollLeft -= (delta*25); // Multiplied by 40
					//e.preventDefault();
					
			    },
	    	  	fetchPosts: function(p = 1)
	    	  	{	    	  	
		    	  	this.$data.posts=null;
		    	    var url = vuesettings.base_url+'wp-json/wp/v2/posts?_embed&per_page=100';
					//?_embed&page='+p+'&per_page='+vuesettings.posts_per_page;
					
					/*
		    	    console.log(vuesettings.offset);
		    	    if(vuesettings.offset)
		    	    {
		    	    	url=url+'&offset='+vuesettings.offset;
		    	    }
		    	    if(vuesettings.order)
		    	    {
		    	    	url=url+'&order='+vuesettings.order;
		    	    }
		    	    if(vuesettings.orderby)
		    	    {
		    	    	url=url+'&orderby='+vuesettings.orderby;
		    	    }
					*/
		    	    console.log(url);
					console.time('fetch');
		    	    fetch(url).then((response)=>{
						console.log("fetched posts!");
						/*
		    	  		this.data='';
		    	    	this.total_posts=response.headers.get('X-WP-Total');
		    	    	this.total_page=response.headers.get('X-WP-TotalPages');
		    	    	this.posts_per_page=vuesettings.posts_per_page;
		    	    	this.current_page=p;
						*/
		    	      return response.json();
		    	      }).then((data)=>{
						console.timeEnd('fetch');
						console.log('finally');
						localStorage.setItem('postscache', JSON.stringify(data));
						console.log(this.posts)
						if (!this.posts || data.length !== this.posts.length) {
							this.posts = data;
							this.calculateImageCount()
						}

						this.ready = true;
		    	      	// setTimeout(() => { this.posts = data; }, 2000);	    	       
		    	    });
		    	},
				calculateImageCount () {
					this.imageCounter = 0;
					for (let i = 0; i < this.posts.length; i++) {
						if (this.posts[i]._embedded['wp:featuredmedia']) {
							this.imageCounter++
						}
					}
					console.log('total posts', this.imageCounter)
				},
				rendered () {
					this.imagesCount++
				}
	    	},
    	 	created () 
    	 	{
		        // window.addEventListener('scroll', this.handleScroll);
				window.addEventListener('mousewheel', this.handleScroll);

		       this.fetchPosts();
			},
		   	beforeMount: function()
		   	{
		   		//Mounted
		   		// document.addEventListener('scroll', this.fetchPosts());
		   	},
			  mounted () {
				  console.log('MOUNTED3');
				  if (localStorage.getItem('postscache')) {
					  this.posts = JSON.parse(localStorage.getItem('postscache'));
					  this.ready = true;
					  console.log('ready from cache!')
					  this.calculateImageCount();
				  }
				  
				  document.querySelector('.search-icon').addEventListener('click', () => {
					  console.log('clicked on search')
					  this.searchOpened = !this.searchOpened;
					  
					  if (this.searchOpened) {
						  this.searchInterval = setInterval(() => {
							  let searchInput = document.getElementsByClassName('search-form')[0];
							  if (!searchInput) {
								  this.searchValue = '';
							  } else {
							  	this.searchValue = searchInput.getElementsByTagName('input')[0].value
								// console.log(this.searchValue)
							  }
						  }, 150)
					  } else {
						  if (this.searchInterval) {
						  	  clearInterval(this.searchInterval)
							  this.searchValue = ''
						  }
					  }
				  })
			  },
		   	destroyed () {
		        // clearInterval(this.interval);
		   		// document.removeEventListener('scroll', this.fetchPosts());
		    },
	          watch: {
				imagesCount: function () {
					if(this.imagesCount == this.imageCounter){
						console.log('all images loaded');
					}
				}
        	},
  });

})();