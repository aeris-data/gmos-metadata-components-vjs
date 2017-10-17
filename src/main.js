require("exports-loader?!./l.min.js")

import Vue from 'vue'

import vueCustomElement from 'vue-custom-element'
Vue.use(vueCustomElement);

import VueI18n from 'vue-i18n'
Vue.use(VueI18n);

import VueResource from 'vue-resource';
Vue.use(VueResource);

import GmosDownload from './gmos-download/gmos-download.vue';
import GmosCart from './gmos-download/aeris-catalog-cart.vue';
import GmosMetadata from './gmos-metadata/md-template-gmos-time-series-metadata.vue';
import GmosTimeSeriesMetadataSummary  from './gmos-download/gmos-time-series-metadata-summary.vue';

ljs.addAliases({
	dep: ['https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
		'https://cdnjs.cloudflare.com/ajax/libs/document-register-element/1.4.1/document-register-element.js', 
		'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment-with-locales.min.js']
})

ljs.load('dep', function() {
	
	if (!window.registredAerisElements) {
		window.registredAerisElements = [];
	}
	
	var timer;
	
	function stopTimer() {
	    clearInterval(timer);
	}
	
	function registerElement(name, component) {
        if (!window.registredAerisElements) {
            window.registredAerisElements = [];
        }
        if (window.registredAerisElements.indexOf(name) < 0) {
            Vue.customElement(name, component);
            window.registredAerisElements.push(name)
        }
    }
	
	function register() {
		console.info("trying to register gmos metadata components")
		if (window.registredAerisElements.indexOf("aeris-metadata-components-vjs") > -1) {
			
			console.info("Start registration of gmos metadata components")
			console.info("Registred elements at this time: "+window.registredAerisElements)
			
			registerElement('gmos-download', GmosDownload);
			registerElement('gmos-time-series-metadata-summary', GmosTimeSeriesMetadataSummary);
			registerElement('md-template-gmos-time-series-metadata', GmosMetadata);
			registerElement('gmos-cart', GmosCart);
						
			stopTimer()
			console.info("Gmos metadata components registration complete")
			
		}
		else {
			console.info("aeris-metadata-components-vjs not available yet...")
		}
	}
	
	timer = setInterval(function(){register()}, 1000);
})

