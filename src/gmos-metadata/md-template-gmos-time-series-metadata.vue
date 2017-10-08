<template>
<span class="md-template-collection-host">
<div class="metadata-container">
<div class="column">
  <aeris-metadata-description></aeris-metadata-description>
  <aeris-metadata-contacts></aeris-metadata-contacts>
  <aeris-metadata-spatial-extents></aeris-metadata-spatial-extents>
  <aeris-metadata-temporal-extents></aeris-metadata-temporal-extents>
  <aeris-metadata-information-links></aeris-metadata-information-links>
  <aeris-metadata-data-access></aeris-metadata-data-access>
  <aeris-metadata-informations></aeris-metadata-informations>
</div>
<div class="column">
  <gmos-download></gmos-download>
  <aeris-metadata-plateforms></aeris-metadata-plateforms>
  <aeris-metadata-formats></aeris-metadata-formats>
  <aeris-metadata-parameters></aeris-metadata-parameters>
  <aeris-metadata-publications></aeris-metadata-publications>
  <aeris-metadata-quicklooks-gallery></aeris-metadata-quicklooks-gallery>
</div>
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
  
  destroyed: function() {
  },
  
  created: function () {
  },

  mounted: function() {
  },
  
  computed: {
  },

   data () {
    return {
    }
  },
  
  updated: function() {
  },
  
  methods: {
  }
}
</script>

<style>

.md-template-collection-host {
	display: block;
	font-size: 14px;
	height: 70vh;
	overflow: scroll;
}

.md-template-collection-host * {
	box-sizing: border-box;
}

.md-template-collection-host .column .component-container {
	margin-bottom: 10px;
   
}

.md-template-collection-host .column~.column {
	margin-left: 10px;
}

.md-template-collection-host .column:first {
	margin-right:10px;
}

.md-template-collection-host * {
	box-sizing: border-box;
}

.md-template-collection-host .metadata-container {
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-around;
}

.md-template-collection-host .metadata-container .column {
	width: 50%;
}

 </style>