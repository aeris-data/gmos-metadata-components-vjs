<i18n>
{
  "en": {
	  "items": "Items",
	  "item": "Item",
	  "yourShoppingCart": "Your shopping cart",
	  "emptyCart": "Empty cart",
	  "validate": "Validate",
	  "downloadScript": "Download script",
	  "loading": "Loading",
	  "downloadingFiles": "Downloading files...",
	  "years": "Year(s):"
  },
  "fr": {
	  "items": "Items",
	  "item": "Item",
	  "yourShoppingCart": "Votre panier ",
	  "emptyCart": "Vider le panier",
	  "validate": "Valider",
	  "downloadScript": "Script de téléchargement",
	  "loading": "Chargement",
	  "downloadingFiles": "Téléchargement en cours...",
	  "years": "Année(s):"
  }
}
</i18n>

<template>
	<span class="aeris-catalog-cart-host" >

	<div class="cart-container">
		<div class="cart-panel-trigger"  style="margin-right: 15px;">
			<span id="cartState" :v-if="calcCollNb"> {{ nbItems }} {{ cartLabel }} </span>
			<i class="fa fa-shopping-cart" :style="{color:cartColor}"></i>
		</div>
	
		<div class="cart-panel">
			<header class="cart-panel-header">
				<h5>{{$t('yourShoppingCart')}}:</h5>
			</header>
	
			<ul class="item-list">
				<template id="cartTemplate"  v-for="item in this.cartContent">
				<li class="cart-line">
					<div>
						<aeris-metadata-international-field class="cart-collection-name" :content="item.collectionName" :lang="lang" no-label-float></aeris-metadata-international-field>
						<span>&nbsp;- {{item.fileNumber}}
							<i class="fileIcon fa fa-file-o"></i>
							<span class="files-size">({{computeFileSize(item.fileSize)}})</span>
						</span>
					</div>
					<div>
					</div>
					<i class="fa fa-trash" @click="removeCartItem(item.collectionId)"></i>
				</li>
				<div class="filter-description" v-if='item.filterDescription' >
				{{item.filterDescription}}
				</div>
				</template>
			</ul>
	
			<footer class="cart-panel-footer">
				<button type="button" class="cart-button" @click="removeAll">
					<i class="fa fa-trash"></i>
					{{$t('emptyCart')}}
				</button>
				<button type="button" class="cart-button green checkout-button" @click="checkout">
					<i class="fa fa-check"></i>
					{{$t('validate')}}
				</button>
				<div class="total-files-size" :v-if="calcFiles">
					{{ totalFiles }}<i class="fa fa-file-o"></i> ({{ totalFilesSize }})
				</div>
			</footer>
	
		</div> <!-- cart panel -->
	
		<div class="cart-popup" v-if="isPopupOpen">
			<div class="popup-title">
				<h3>{{$t('downloadScript')}}</h3>
				<div @click="closePopup">
					<i class="fa fa-times"></i>
				</div>
			</div>
	
			<div class="popup-content">
				<pre class="text-to-copy language-bash">{{downloadScript}}</pre>            
				<div class='popup-buttons'>	
					<div class="map-rounded-button catalog-round-button"  @click="downloadFile">
						<i class="fa fa-download"></i>
					</div>
					<div class="map-rounded-button catalog-round-button" @click="copyToClipBoard">
						<i class="fa fa-clipboard"></i>
					</div>		
					<div class="map-rounded-button catalog-round-button" @click="cancel">
						<i class="fa fa-undo"></i>
					</div>
				</div>
			</div>
		
		</div> <!-- cart popup -->

	</div> <!-- cart container -->
	</span>
</template>
<script>
export default {
  props: {
  	lang:  {
      type: String,
      default: 'en'
    },
    cartService: String,
    cartToken: String
  },
  
  watch: {
    lang (value) {
	      this.$i18n.locale = value
    }
  },
  
  destroyed: function() {
	  document.removeEventListener('addItemToCartEvent', this.addListener);
	  this.addListener = null;
	  document.removeEventListener('deleteItemFromCartEvent', this.removeListener);
	  this.removeListener = null;
	  document.removeEventListener('cartContentRequest', this.contentRequestListener);
	  this.contentRequestListener = null;
  },
  
  created: function () {
	  console.log("Aeris catalog cart - Creating");
	  this.$i18n.locale = this.lang;

	  this.addListener = this.addItemToCart.bind(this);
      document.addEventListener('addItemToCartEvent', this.addListener);
      
      this.removeListener = this.removeCartItemFromEvent.bind(this);
      document.addEventListener('deleteItemFromCartEvent', this.removeListener);
      
      this.contentRequestListener = this.contentRequestHandler.bind(this);
      document.addEventListener('cartContentRequest', this.contentRequestListener);
      
      // separated carts
      this.cartToken ? this.cartName = 'AerisCatalogCart-' + this.cartToken : this.cartName = 'AerisCatalogCart';
      this.loadCart();

  },

  mounted: function() {
  },
  
  computed: {
	  
	cartColor: function() {
		if (this.cartContent.length > 0) {
			return '#f39c12';
		}
		else {
			return 'gainsboro';			
		}
	},

	calcCollNb: function() {
		if (this.cartContent.length > 0) {
			this.nbItems = this.cartContent.length;
			if (this.cartContent.length > 1) {
				this.cartLabel = this.$i18n.t('items', this.lang);
			} else {
				this.cartLabel = this.$i18n.t('item', this.lang);
			}	
		} else {
			this.nbItems = null;
			this.cartLabel = null;
		}
		return this.nbItems > 0 ? true : false;
	},	
	calcFiles: function(){
		var filesNumber = 0;
		var filesSize = 0;
        this.cartContent.forEach(function(collection) {
	        	filesNumber += collection.fileNumber;
	        	filesSize += collection.fileSize;
        	});
        this.totalFiles = filesNumber;
        this.totalFilesSize = this.computeFileSize(filesSize);
        return this.totalFiles > 0 ? true : false;
	},
	togglePopup: function() {
		this.isPopupOpen = !this.isPopupOpen;
		return this.isPopupOpen;
	}
	
  },

   data () {
    return {
    	nbItems : null,
    	cartContent: [],
    	cartName: '',
    	cartLabel: null,
    	totalFiles: null,
    	totalFilesSize: null,
    	downloadScript: null,
    	isPopupOpen: false,
    	addListener : null,
    	removeListener: null,
    	contentRequestListener: null
    }
  },
  
  updated: function() {
  },
  
  methods: {
	  
	contentRequestHandler: function() {
		this.dispatchContent();
	},
	
	dispatchContent: function() {
		 var event = new CustomEvent('cartContentResponse',  { detail: {cartContent: this.cartContent}});
         document.dispatchEvent(event);
	},
	
	
	filterDescription: function(item) {
		if (item.items) {
			if (item.items.type.toLowerCase()=="yearfilter") {
				var aux = item.items.elements;
				aux.sort();
				var result =this.$i18n.t("years")+" ";
				for (var i = 0; i < aux.length; i++) {
					result = result+aux[i];
					if (i < (aux.length-1)) {
						result = result+", "
					}
				}
				return result;
			}
		}
		return null;
	},
	
	
	// catch event when an item is added 
	addItemToCart: function(ev) {
		
        var item = ev.detail;
        var alreadyAdded = false;
        
        /* If corresponding collection is already present in the cart, add the item to it */
        for (var j = 0; j < this.cartContent.length; j++) {
        	var collection = this.cartContent[j]
        	if (collection.collectionId === item.collectionId) {
        		console.log('eeeeeee')
        		for (var i = 0; i < item.elements.length; i++) {
        			var index = collection.items.elements.indexOf(item.elements[i])
        			if (index <0) {
        				collection.items.elements.push(item.elements[i]);
        			}
        			collection.fileNumber += item.fileNumber;
        			collection.fileSize += item.totalSize;
        		}
        		collection.filterDescription=this.filterDescription(collection);
        		this.$set(this.cartContent, j, collection)
        		alreadyAdded = true;
        	}
        }

        /* If collection is not already present in the cart, create it and add item */
        if (!alreadyAdded) {
          var coll = {
        	collectionId: item.collectionId,
        	id: item.collectionId,
            collectionName: item.collectionName,
            url: item.url,
            fileNumber: item.fileNumber,
            fileSize: item.totalSize,
            items: {
              type: item.type,
              elements: item.elements
            }
          }

          coll.filterDescription=this.filterDescription(coll);
          this.cartContent.push(coll);
        }

        this.saveCart();
        this.dispatchContent();
    	
	},

    /* Save/load cart into/from localstorage */
    saveCart: function() {
      //if(localStorage) localStorage.setItem(this.cartName, JSON.stringify(this.cartContent));
    },    
	loadCart: function() {
		//if(localStorage) this.cartContent = JSON.parse(localStorage.getItem(this.cartName)) || [];
	},
	
	// remove an item from cart from another component (calendar i.e.)
	removeFromCart: function(data) {
		console.log(data);
		//this.refreshCart();
	},
	
	removeCartItemFromEvent : function (e) {
		var result = []
		 var item = e.detail;
		 for (var j = 0; j < this.cartContent.length; j++) {
	        	var collection = this.cartContent[j]
		        if (collection.collectionId === item.collectionId) {
	        		for (var i = 0; i < item.elements.length; i++) {
	        			var index = collection.items.elements.indexOf(item.elements[i])
	        			if (index>=0) {
	        				collection.items.elements.splice(index,1);
	        			}
	        			collection.filterDescription=this.filterDescription(collection);
	        			collection.fileNumber -= item.fileNumber;
	        			collection.fileSize -= item.totalSize;
	        		}
	        	}
	        	if (collection.items.elements.length>0) {
	        	result.push(collection)
	        	}
		 }
		 this.cartContent = result;
		 this.dispatchContent();
	},
	
	// remove an item from cart content using the cart remove button 
    removeCartItem: function(collectionId) {
    
      var cartClone = this.cartContent;
      cartClone.forEach(function(collection, ind) {
        if(collection.collectionId === collectionId) {
          cartClone.splice(ind, 1);
        }
      });

      this.saveCart();
      this.dispatchContent();
    },
    
    // empty the whole cart
	removeAll: function() {
		this.cartContent = [];
	    this.saveCart();
	    this.dispatchContent();
	},
	
	
    
	handleSuccessScript : function(response) {
		this.downloadScript = response.data;
	},
	
	handleErrorScript: function(response) {
		console.log("Cart - Error while accessing server:"); 
		var error = response.status;
		var message = response.statusText;
		if(!error) message = 'Can\'t connect to the server';
		console.log('Error ' + error + ': ' + message);
	},
	
	handleErrorDownload: function(response) {
		console.log("Cart - Error while accessing server:");
		document.dispatchEvent(new CustomEvent('aerisLongActionStopEvent', { 'detail': {message: this.$t('downloadingFiles')}}))
		var error = response.status;
		var message = response.statusText;
		if(!error) message = 'Can\'t connect to the server';
		console.log('Error ' + error + ': ' + message);
	},
	
	computeFileSize: function(size) {
		if(size === 0) return 0;
		size = Math.abs(parseInt(size, 10));
		var def = [[1, 'octets'], [1024, 'ko'], [1024*1024, 'Mo'], [1024*1024*1024, 'Go'], [1024*1024*1024*1024, 'To']];
		for(var i=0; i < def.length; i++){
		try {
			if(size < def[i][0]) return (size / def[i - 1][0]).toFixed(2) + def[i - 1][1];
			} catch (e) {
			console.log(e);
			}
		}
	},
	
	checkout: function() {
		this.togglePopup;
		var url = this.cartService + '/toscript';
		this.$http.post(url, JSON.stringify(this.cartContent))
					.then((response)=>{this.handleSuccessScript(response)},(response)=>{this.handleErrorScript(response)});
	},
	
	downloadFile: function() {
       /* Show notification */    
		document.dispatchEvent(new CustomEvent('aerisLongActionStartEvent', { 'detail': {message: this.$t('downloadingFiles')}}))
		var url = this.cartService + '/download';
		this.$http.post(url,  JSON.stringify(this.cartContent), {headers: {'Content-Type': 'application/zip', 'Accept': 'application/zip'}, responseType: 'blob'})
					.then((response)=>{this.handleSuccessDownload(response)},(response)=>{this.handleErrorDownload(response)});
	},
    
	handleSuccessScript: function(response) {
		this.downloadScript = response.data;
	},
	
	handleSuccessDownload: function(response) {
        var blob = new Blob([response.body], {type: "octet/stream"});
        var randomId = Math.floor((1 + Math.random()) * 0x10000)
                      .toString(16)
                      .substring(1);
        var fileName = "download-"+ randomId + ".zip";
        
        saveAs(blob, fileName);
         /* Hide notification */
        document.dispatchEvent(new CustomEvent('aerisLongActionStopEvent', { 'detail': {message: this.$t('downloadingFiles')}}))
        this.removeAll();
        this.togglePopup();
	},
	
	handleError: function(response) {
		console.log("Cart checkout - Error while accessing server:"); 
		var error = response.status;
		var message = response.statusText;
		if(!error) message = 'Can\'t connect to the server';
		console.log('Error ' + error + ': ' + message);
	},
	
	copyToClipBoard: function() {
		var selection = window.getSelection(); 
		var copyTextarea = this.$el.querySelector('.text-to-copy');
		var range = document.createRange();

		range.selectNodeContents(copyTextarea);
		selection.removeAllRanges();
		selection.addRange(range);

		try {
			var successful = document.execCommand('copy');
			selection.removeAllRanges();
		} catch (err) {
			console.log('Unable to copy');
		}
	},
	
	closePopup: function() {
		this.isPopupOpen = !this.isPopupOpen;
	},
	
	cancel: function() {
		// close the popup but does not empty the cart
		this.isPopupOpen = !this.isPopupOpen;
	},
	
	refreshComponents: function(e) {
		var collectionId = e.detail.collectionId;
		var currentColl;
		var collectionExists = false;
		
		this.cartContent.forEach(function(collection) {
			if(collection.collectionId === collectionId) {
				currentColl = collection;
				collectionExists = true;
			}
		}.bind(this));

		var event = null;
	},	
	
	
	
  }
}
</script>

<style>

	.aeris-catalog-cart-host {
		box-sizing: border-box;
		display: block;
		background: transparent;
	}
	
	.aeris-catalog-cart-host .cart-container {
		position: relative;
		display: flex;
		align-items: center;
	}
	
	.aeris-catalog-cart-host .cart-container .nb-items {
		position: relative;
		display: inline-block;
		padding: 3px 5px;
		background-color: #f39c12;
		border-radius: 3px;
		color: #fff;
		font-size: 12px;
	}
	
	.aeris-catalog-cart-host .cart-container .nb-items:after {
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		content: '';
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 5px 0 5px 5px;
		border-color: transparent transparent transparent #f39c12;
	}
	
	.aeris-catalog-cart-host .cart-container.hidden {
		display: none;
	}
	
	.aeris-catalog-cart-host .fa {
		margin: 0 5px;
	}
	
	.aeris-catalog-cart-host .cart-panel-trigger {
		padding: 3px 5px;
		color: #ddd;
	}
	
	.aeris-catalog-cart-host .cart-panel-trigger .fa-shopping-cart {
		margin-left: 3px;
	}
	
	.aeris-catalog-cart-host .cart-panel {
		display: none;
		position: absolute;
		top: 99%;
		right: 0;
		z-index: 9999;
		max-height: 500px;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 10px;
		background-color: #fff;
		border: 1px solid #ddd;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.6);
		font-size: 14px;
	}
	
	.aeris-catalog-cart-host .cart-panel * {
		white-space: nowrap;
	}
	
	.cart-panel:hover, .cart-panel-trigger:hover + .cart-panel {
		display: inline-block;
	}
		
	.aeris-catalog-cart-host .item-list {
		margin: 10px;
		padding: 0;
		list-style: none;
		line-height: 1.2em;
	}
	
	.aeris-catalog-cart-host .item-list .files-size {
		font-size: 10px;
	}
	
	.aeris-catalog-cart-host .item-list .fa-trash {
		margin-left: 20px;
	}
	
	.aeris-catalog-cart-host .item-list .fa-trash:hover {
		cursor: pointer;
		color: #e74c3c;
	}
	
	.aeris-catalog-cart-host .item-list li {
		display: flex;
		justify-content: space-between;
		flex-flow: row nowrap;
		padding: 3px 0;
	}
	
	.aeris-catalog-cart-host .item-list li * {
		display: flex;
		flex-flow: row nowrap;
	}
	
	.aeris-catalog-cart-host .item-list li:not(:last-of-type) {
		border-bottom: 1px solid rgba(221, 221, 221, 0.5);
	}
	
	.aeris-catalog-cart-host .cart-panel-header {
		border-bottom: 1px solid #ddd;
	}
	
	.aeris-catalog-cart-host .cart-panel-header h5 {
		margin: 5px 0;
	}
	
	.aeris-catalog-cart-host .cart-panel-footer {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		margin-top: 5px;
		border-top: 1px solid #ddd;
	}
	
	.aeris-catalog-cart-host .cart-panel-footer .cart-button {
		display: inline-flex;
		align-items: center;
		margin: 5px;
		padding: 3px 5px 3px 0;
		color: var(--main-color, #4765a0);
		background-color: #fff;
		border: 1px solid;
	}
	
	.aeris-catalog-cart-host .cart-panel-footer .cart-button:hover {
		cursor: pointer;
		background-color: var(--main-color, #4765a0);
		color: #fff;
		border-color: var(--main-color, #4765a0);
	}
	
	.aeris-catalog-cart-host .cart-panel-footer .cart-button.green {
		background-color: #fff;
		color: #2EB872;
		border-color: #2EB872;
	}
	
	.aeris-catalog-cart-host .cart-panel-footer .cart-button.green:hover {
		background-color: #2EB872;
		color: #fff;
		border-color: #2EB872;
	}
	
	.aeris-catalog-cart-host .cart-panel-footer .total-files-size {
		font-size: 10px;
	}
	
	.aeris-catalog-cart-host .cart-collection-name {
		font-weight: bold;
	}
	
	.aeris-catalog-cart-host .cart-collection-name:hover {
		cursor: pointer;
		opacity: 0.8;
	}
	
	.aeris-catalog-cart-host .cart-popup {
		display: inline-block;
		position: fixed;
		z-index: 9999;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #fff;
		box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
		border: 1px solid #ddd;
		border-radius: 5px;
		padding: 10px;
	}
	
	.aeris-catalog-cart-host .cart-popup .popup-title, .aeris-catalog-cart-host .cart-popup h3 {
		margin: 0;
		padding: 0;
		width: 100%;
	}
	
	.aeris-catalog-cart-host .cart-popup .popup-title {
		display: flex;
		flex: space-between;
	}
	
	.aeris-catalog-cart-host .cart-popup .popup-title i {
		cursor: pointer;
		color: #888;
		opacity: 0.5;
	}
	
	.aeris-catalog-cart-host .cart-popup .popup-title i:hover {
		opacity: 1;
	}
	
	.aeris-catalog-cart-host .cart-popup .popup-content {
		margin: 0;
		padding: 0;
		width: 100%;
		display: flex;
	}
	
	.aeris-catalog-cart-host .cart-popup pre {
		margin: 20px 10px;
		padding: 5px;
		resize: none;
		min-width: 600px;
		max-width: 600px;
		min-height: 300px;
		max-height: 300px;
		word-wrap: break-word;
		border-radius: 5px;
	}
	
	.aeris-catalog-cart-host .cart-popup .popup-buttons {
		width: 100%;
		display: flex;
		flex: flex-start;
		flex-direction: column;
		margin: 20px 10px;
		padding: 5px;
	}
	
	.aeris-catalog-cart-host .cart-popup .catalog-round-button {
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;
		right: 10px;
		width: 50px;
		height: 50px;
		margin: 10px 0;
		border: 2px solid;
		border-radius: 50%;
		color: #fff;
		font-size: 18px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
		background-color: var(--search-button-color, #4765a0);
		transition: background-color 0.3s;
	}
	
	.aeris-catalog-cart-host .cart-popup .catalog-round-button:hover {
		cursor: pointer;
		background-color: var(--search-button-hover-color, #4765a0);
	}
	
	.aeris-catalog-cart-host .cart-popup .catalog-round-button :active {
	    vertical-align: top;
	    padding: 8px 8px 6px;
	}
	.aeris-catalog-cart-host .filter-description {
		font-size: smaller;
	}
	
 </style>