<i18n>
{
  "en": {
  	"download": "Download",
  	"explicationText": "To download the data files, add them to the cart by clicking here."
  },
  "fr": {
  	"download": "Téléchargement",
  	"explicationText": "Pour télécharger les fichiers de données, ajoutez-les au panier en cliquant ici."
  }
}
</i18n>

<template>
<span class="gmos-download-host" v-if="visible">
 <div class="component-container">
      <header>
        <h3><i class="fa fa-download"></i>{{$t('download')}}</h3>
        <div class="aeris-icon-group"></div>
      </header>
      
      <main>   
      	  <span class="explication">{{$t('explicationText')}}</span>
      </main>
    </div>
</span>
</template>

<script>
export default {
	props: {
		lang:  {
			type: String,
			default: 'en'
		}
	},
  
	mounted: function() {
		var event = new CustomEvent('aerisThemeRequest', {});
		document.dispatchEvent(event);
	},
   
	watch: {
		lang (value) {
			this.$i18n.locale = value
		}
	},
  
	destroyed: function() {
		document.removeEventListener('aerisMetadataRefreshed', this.aerisMetadataListener);
		this.aerisMetadataListener = null;
		document.removeEventListener('aerisTheme', this.aerisThemeListener);
		this.aerisThemeListener = null;
	},
  
	created: function () {
		console.log("Eurochamp download - Creating");
		this.$i18n.locale = this.lang;
		// for rest services
		this.service = document.querySelector('aeris-catalog').attributes.getNamedItem('download-service').value;
		// to get the datas
	    this.aerisMetadataListener = this.handleRefresh.bind(this);
	    document.addEventListener('aerisMetadataRefreshed', this.aerisMetadataListener);
	    // to apply theme
	    this.aerisThemeListener = this.handleTheme.bind(this);
	    document.addEventListener('aerisTheme', this.aerisThemeListener);
	    // to get the cart response, asking if the collection is already in the cart
	    this.cartResponseListener = this.drawSelected.bind(this);
        document.addEventListener('cartResponse', this.cartResponseListener);
	    // if the cart is modified directly, it fires an event to warn it was modified
	    this.cartChangeListener = this.refresh.bind(this);
        document.addEventListener('callCartRefreshNow', this.cartChangeListener);
        
	},
  
	updated: function() {
		this.ensureTheme();
	},
  
	computed: {
		
	},
  
	data () {
		return {
			visible: true,
			theme : null,
			aerisThemeListener: null,
			aerisMetadataListener: null,
			cartResponseListener: null,
			data:  {},
			downloadEntries : {},
			service : null,
			uuid: null,
			collectionName: null,
			isInCart: false,
			classesButton: "metadata-text-btn"
		}
	},
  
	methods: {

		handleRefresh: function(data) {
			console.log("eurochamp download - Refreshing");
			
			this.uuid = data.detail.uuid;
			this.collectionName = data.detail.resourceTitle;
			
			this.visible = false;
			if (this.service && this.uuid) {
				var url = null;
				if (this.service.endsWith('/')) {
					this.service = this.service.substring(0, this.service.length - 1);
				}				
				url = this.service+"/request?collection="+this.uuid;
				this.$http.get(url).then((response)=>{this.handleSuccess(response)},(response)=>{this.handleError(response)});
			}
		},
		
		handleTheme: function(event) {
	  		 if (this.visible) {
	  			if (this.$el.querySelector("header")) {
		  			this.$el.querySelector("header").style.background=event.detail.primary;
		  		 }
				this.theme = event.detail
				this.ensureTheme();
	  		 }
	  		
		},
		
		ensureTheme: function() {
	  		 if (this.visible) {
	 			if (this.theme) {
	 		  		var primary = this.theme.primary;
	 		  		var darker =  this.colorLuminance(primary, -0.3);
	 		  		
	 		  		var self = this;
	 		  		var explicationText = this.$el.querySelector('.explication');
	 		  		explicationText.style.color = primary;
	 		  		
	 		  		var header = this.$el.querySelector("header");
	 		  		header.style.background = primary;
	 		  		console.log("XXXX")
	 				var elems = this.$el.querySelectorAll('main div button');
	 				var index = 0, length = elems.length;
	 				
	 				for ( ; index < length; index++) {
	 					var buttonAdd = elems[index];
	 					elems[index].style.color = primary;
	 					elems[index].style.background = "#FFFFFF";
 						buttonAdd.style.borderColor = primary;
	 				
 						elems[index].addEventListener("mouseout", function() {
	 						buttonAdd.style.background = "#FFFFFF";
	 						buttonAdd.style.color = primary;
	 						buttonAdd.style.borderColor = primary;
	 					})
	 					
	 					if (!this.isInCart) {
	 						elems[index].addEventListener("mouseover", function() {
			 						buttonAdd.style.background = primary;
			 						buttonAdd.style.color = darker;	
			 						buttonAdd.style.borderColor = darker;
			 						buttonAdd.style.cursor = "pointer"
		 					})	
	 					} else {
	 						elems[index].addEventListener("mouseover", function() {
	 							buttonAdd.style.background = "#FFFFFF";
		 						buttonAdd.style.color = primary;
		 						buttonAdd.style.borderColor = primary;
		 						buttonAdd.style.cursor = "default"
	 					})	
	 					}
	 				}	
	
	 			}
	  		 }
		},
		      
	  	colorLuminance: function (hex, lum) {
	  		//from https://www.sitepoint.com/javascript-generate-lighter-darker-color/
	  		// validate hex string
	  		hex = String(hex).replace(/[^0-9a-f]/gi, '');
	  		if (hex.length < 6) {
	  			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	  		}
	  		lum = lum || 0;

	  		// convert to decimal and change luminosity
	  		var rgb = "#", c, i;
	  		for (i = 0; i < 3; i++) {
	  			c = parseInt(hex.substr(i*2,2), 16);
	  			c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
	  			rgb += ("00"+c).substr(c.length);
	  		}

	  		return rgb;
	  	},
	  	
		handleSuccess : function(response) {
			this.downloadEntries = response.body.entries;
			if (this.downloadEntries.length > 0){
				this.visible = true;
				this.refresh();
			}
		
		},
		
		handleError: function(response) {
			console.log("Eurochamp download - Error while accessing server:"); 
			var error = response.status;
			var message = response.statusText;
			if(!error) message = 'Can\'t connect to the server';
			console.log('Error ' + error + ': ' + message);
		},
		
		addToCart: function(e) {
			if (!this.isInCart) {
				var url_download_service = this.service;
				var item = e;
			        
				var obj = {
					collectionName: JSON.stringify(this.collectionName),
					url: url_download_service,
					collectionId: this.uuid,
		        	id: this.uuid,
					data: '',
					fileNumber: item.fileNumber,
					fileSize: item.totalSize,
					type: 'nofilter'
				};
				var event = new CustomEvent('addItemToCart', {detail: obj, lang: this.lang});
		 		document.dispatchEvent(event);
		 		this.isInCart = true;	
		 		this.toggleState();
			}
		},
		
		// fire the event to ask if the collection is already in the cart
		refresh: function() {
			var event = new CustomEvent('refreshFromCart', {detail: { collectionId: this.uuid }, lang: this.lang});
		 	document.dispatchEvent(event);
		 	this.toggleState();
		},
		
		drawSelected: function(e) {
			this.isInCart = e.detail ? true : false;
			// when the event is sent from the cart without being asked (when the cart is already displayed) force the toggleState
			if (document.getElementById("btnAdd")) {
				this.toggleState();
			}
		},
		
		toggleState: function() {
			if (this.isInCart) {
				this.classesButton += " button-added-to-cart";
			} else {
				this.classesButton = "metadata-text-btn";
			}
		}
	
	} // methods
	
} // default
</script>

<style>
	.gmos-download-host {
		display: block;
	}
	
	.gmos-download-host .explication{
		font-size: 12px;
		color: rgb(71, 101, 160);
	}
	
	.gmos-download-host .button-container {
		display: flex;
		flex-flow: row wrap;
		justify-content: space-around;
		margin: 5px 0;
		padding: 5px;
	}
	
	.gmos-download-host .button-container button.metadata-text-btn {
		display: inline-flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		margin: 5px;
		padding: 0;
		text-align: center;
		transition: 0.3s;
		border-radius: 2px;
	}
	
	.gmos-download-host .downloadButton {
		display: inline-flex;
		flex-direction: row;
	
	}
	.gmos-download-host .button-container button.metadata-text-btn i {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 40px;
		min-height: 40px;
	}	
	.gmos-download-host .button-container button.metadata-text-btn span.textDisplayed {
		display: inline-block;
    	vertical-align: middle;
		height: 100%;
		padding: 3px 10px;
		margin: auto 0;
	}
	
 </style>