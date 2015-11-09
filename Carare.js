	var popupImageSource = OpenLayers.Util.getImageLocation("cloud-popup-relative.png");
	var lastPlaceName = "";
	var lastUser = "";
	var lastCollection = "";
	var lastgid = 0;
	var lastType = 0;
	var currentType = "&nbsp;";
	var updateUserAreaPoint;
	var googlemap;
	var lastCoordinates;
	var lastZoom;
	var permalinkState = [];
	var extendedExtent = new OpenLayers.Bounds();
	var isWithingLastExtendedExtent = false;
	
	function GetQueryString(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.search);
		if (results == null)
			return "";
		else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	function init() {
		//document.domain = 'athenaplus.eculturelab.eu';
		// IE XML fix
		var _class = OpenLayers.Format.XML;
		var originalWriteFunction = _class.prototype.write;
		var patchedWriteFunction = function()
		
		{
			var child = originalWriteFunction.apply( this, arguments );
			child = child.replace(new RegExp('xmlns:NS\\d+="" NS\\d+:', 'g'), ''); 	
			return child;
		}
		_class.prototype.write = patchedWriteFunction;

		// use HTML 5 Geolocation if mobile device
		if( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/Android/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i)) || (navigator.userAgent.match(/Mobile/i))) { 
			mobileDevice = true;
			if (navigator.geolocation){
			     navigator.geolocation.getCurrentPosition(showPosition,
                                             showPositionError,
                                             {maximumAge:600000, timeout: 5000});
			}
		} else {
			CarareInit();
		}
	}
	function CarareInit() {
			//IE9 and lower detection
			var ieLT9 = false;
			if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { 
			   var ieversion=new Number(RegExp.$1);
			   if (ieversion<=8)
			   {
				ieLT9 = true;
			   }		   
			}
			
			if (GetQueryString("SEARCH") == "NO") {
				document.getElementById('searchButton').style.display = "none";
			}
			var bounds = new OpenLayers.Bounds(-2.003750834E7, -2.003750834E7, 2.0037508345578495E7, 2.0037508345578495E7);
			


			if (GetQueryString("TITLE") != "" || GetQueryString("ID") != "") {			
				map = new OpenLayers.Map('map', {
						projection : "EPSG:900913",
						maxExtent : bounds,
						units : 'm',
						resolution : 10000,
						zoomDuration: 0
					});
			} else {
				if (initialCenter == null) {
					initialCenter = new OpenLayers.LonLat(1500000, 6425000);	
				}	
				map = new OpenLayers.Map('map', {
						projection : "EPSG:900913",
						maxExtent : bounds,
						units : 'm',
						resolution : 10000,
						center : initialCenter,
						zoomDuration: 0
					});
			}
		
		
		// OpenStreet layer
		var layerOSM = new OpenLayers.Layer.OSM("Open Street Map", null, {
				transitionEffect : 'resize'
			});
		
		// Google layers
		var ghyb = new OpenLayers.Layer.Google(
				"Google Hybrid", {
				type : google.maps.MapTypeId.HYBRID,
				numZoomLevels : 19,
				visibility : false
			}, {
				transitionEffect : 'resize'
			});
		
		var gmap = new OpenLayers.Layer.Google(
				"Google Streets", // the default gsat,gmap,ghyb
			{
				numZoomLevels : 19,
				visibility : false
			}, {
				transitionEffect : 'resize'
			});
		var gsat = new OpenLayers.Layer.Google(
				"Google Satellite", {
				type : google.maps.MapTypeId.SATELLITE,
				numZoomLevels : 19,
				visibility : false
			}, {
				transitionEffect : 'resize'
			});
			
		var gphy = new OpenLayers.Layer.Google(
				"Google Physical", {
				type : google.maps.MapTypeId.TERRAIN
			}, {
				transitionEffect : 'resize',
				visibility: false
			});
		
		// Carare cached layer for display only
		function layerCarareCachedOpacity() {
			if(ieLT9 == true){
				return 1.0;
			}else{
				return 0.7;
			}
		}
		layerAllCachedCluster = new OpenLayers.Layer.WMS("CacheCluster",
				geoserverLocation+"/gwc/service/wms", {
				layers : "PostGIS:MC_Cen4_c_view",
				transparent : "true",
				format : 'image/png'
				
			}, {
				visibility : true,
				maxScale : 216000,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				transitionEffect: null,
				opacity: 1
			});
			
		layerAllCached = new OpenLayers.Layer.WMS("All",
				geoserverLocation+"/gwc/service/wms", {
				layers : "PostGIS:"+geoserverAllLayer,
				transparent : "true",
				format : 'image/png'
				
			}, {
				visibility : false,
				minScale : 216000,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				transitionEffect: null,
				opacity: layerCarareCachedOpacity()
			});
			
		layerCarareCached = new OpenLayers.Layer.WMS("Carare",
				geoserverLocation+"/gwc/service/wms", {
				layers : "PostGIS:"+geoserverCarareCachedLayer,
				transparent : "true",
				format : 'image/png'
				
			}, {
				visibility : false,
				minScale : 216000,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				transitionEffect: null,
				opacity: layerCarareCachedOpacity()
			});
		
		layerLinkedHeritageCached = new OpenLayers.Layer.WMS("Linked Heritage",
				geoserverLocation+"/gwc/service/wms", {
				layers : "PostGIS:"+geoserverLinkedCachedLayer,
				transparent : "true",
				format : 'image/png'
				
			}, {
				visibility : false,
				minScale : 216000,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				transitionEffect: null,
				opacity: layerCarareCachedOpacity()
			});
			
		layerPartagePlusCached = new OpenLayers.Layer.WMS("Partage Plus",
				geoserverLocation+"/gwc/service/wms", {
				layers : "PostGIS:"+geoserverPartageCachedLayer,
				transparent : "true",
				format : 'image/png'
				
			}, {
				visibility : false,
				minScale : 216000,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				transitionEffect: null,
				opacity: layerCarareCachedOpacity()
			});
			
		layerAthenaPlusCached = new OpenLayers.Layer.WMS("Athena Plus",
				geoserverLocation+"/gwc/service/wms", {
				layers : "PostGIS:"+geoserverAthenaCachedLayer,
				transparent : "true",
				format : 'image/png'
				
			}, {
				visibility : false,
				minScale : 216000,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				transitionEffect: null,
				opacity: layerCarareCachedOpacity()
			});
			
			layerPhotographyCached = new OpenLayers.Layer.WMS("Photography",
				geoserverLocation+"/gwc/service/wms", {
				layers : "PostGIS:"+geoserverPhotographyCachedLayer,
				transparent : "true",
				format : 'image/png'
				
			}, {
				visibility : false,
				minScale : 216000,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				transitionEffect: null,
				opacity: layerCarareCachedOpacity()
			});
			
			layer3DIconsCached = new OpenLayers.Layer.WMS("3DIcons",
				geoserverLocation+"/gwc/service/wms", {
				layers : "PostGIS:"+geoserver3DIconsCachedLayer,
				transparent : "true",
				format : 'image/png'
				
			}, {
				visibility : false,
				minScale : 216000,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				transitionEffect: null,
				opacity: layerCarareCachedOpacity()
			});
			
		// invisible Carare for getFeature only with no filter
		layerAll = new OpenLayers.Layer.WMS("1All",
				geoserverLocation+"/PostGIS/wms", {
				layers : "PostGIS:"+geoserverAllLayer,
				transparent : "true",
				format : 'image/png'
			}, {
				visibility : false,
				transitionEffect: null,
				isBaseLayer : false,
				displayInLayerSwitcher : false
			});
		
		layerUserArea = new OpenLayers.Layer.WMS("User area",
				geoserverLocation+"/PostGIS/wms", {
				layers : "PostGIS:"+geoserverUserAreaLayer,
				transparent : "true",
				myData: Math.random(),
				format : 'image/png'
				
			}, {
				visibility : false,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				singleTile: true, 
				ratio: 1,
				transitionEffect: null,
				opacity: layerCarareCachedOpacity()
			});
		
		// CLUSTERING STYLE
		var styleMap = new OpenLayers.Style();

		var clusterRule1 = new OpenLayers.Rule({
		  filter: new OpenLayers.Filter.Comparison({
			  type: OpenLayers.Filter.Comparison.LESS_THAN,
			  property: "count",
			  value: 2
		  }),
		  symbolizer: {pointRadius: 6, fillColor: "#ab4fff", fillOpacity: 1, stroke: false}
		});

		var clusterRule2 = new OpenLayers.Rule({
		  filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.BETWEEN,
				property: "count",
			    lowerBoundary: 2,
				upperBoundary: 10
		  }),
		  symbolizer: {externalGraphic: '/icons/cluster/cluster_m1.png', graphicOpacity: 1, graphicWidth: 53, graphicHeight: 52, labelAlign: "cm", labelYOffset: 0, labelOutlineWidth: 0, fontWeight: "bold", label: "${count}", fontSize: "12px"}
		});
		
		var clusterRule3 = new OpenLayers.Rule({
		  filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.BETWEEN,
				property: "count",
			    lowerBoundary: 10,
				upperBoundary: 100
		  }),
		  symbolizer: {externalGraphic: '/icons/cluster/cluster_m2.png', graphicOpacity: 1, graphicWidth: 56, graphicHeight: 55, labelAlign: "cm", labelYOffset: 0, labelOutlineWidth: 0, fontWeight: "bold", label: "${count}", fontSize: "12px"}
		});
		
		var clusterRule4 = new OpenLayers.Rule({
		  filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.BETWEEN,
				property: "count",
			    lowerBoundary: 100,
				upperBoundary: 10000
		  }),
		  symbolizer: {externalGraphic: '/icons/cluster/cluster_m3.png', graphicOpacity: 1, graphicWidth: 66, graphicHeight: 65, labelAlign: "cm", labelYOffset: 0, labelOutlineWidth: 0, fontWeight: "bold", label: "${count}", fontSize: "12px"}
		});
		
		var clusterRule5 = new OpenLayers.Rule({
		  filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.BETWEEN,
				property: "count",
			    lowerBoundary: 1000,
				upperBoundary: 10000
		  }),
		  symbolizer: {externalGraphic: '/icons/cluster/cluster_m4.png', graphicOpacity: 1, graphicWidth: 78, graphicHeight: 77, labelAlign: "cm", labelYOffset: 0, labelOutlineWidth: 0, fontWeight: "bold", label: "${count}", fontSize: "12px"}
		});
		
		var clusterRule6 = new OpenLayers.Rule({
		  filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
				property: "count",
			    value: 10000
		  }),
		  symbolizer: {externalGraphic: '/icons/cluster/cluster_m5.png', graphicOpacity: 1, graphicWidth: 90, graphicHeight: 89, labelAlign: "cm", labelYOffset: 0, labelOutlineWidth: 0, fontWeight: "bold", label: "${count}", fontSize: "13px"}
		});

		styleMap.addRules([clusterRule1, clusterRule2, clusterRule3, clusterRule4, clusterRule5, clusterRule6]);
		
		var clusteringSearch = new OpenLayers.Strategy.Cluster();
		clusteringSearch.distance = 70;
		
		layerSearchCluster = new OpenLayers.Layer.Vector(
            "SearchCluster",
            {	strategies: [clusteringSearch],
				projection: new OpenLayers.Projection("EPSG:900913"),
				styleMap: styleMap,
				//rendererOptions: {yOrdering: true},
				displayInLayerSwitcher : false,
				maxScale : 216000
         });
		 
		layerSearchCluster.events.on({
			featureselected: function(event) {
				if (event.feature.attributes.count > 1) {
					map.setCenter(new OpenLayers.LonLat(event.feature.geometry.x, event.feature.geometry.y), map.getZoom()+3);
					//map.panTo(new OpenLayers.LonLat(event.feature.geometry.x, event.feature.geometry.y));
				} else {
					//var xy = map.getPixelFromLonLat(new OpenLayers.LonLat(event.feature.geometry.x, event.feature.geometry.y));
					//map.setCenter(new OpenLayers.LonLat(event.feature.geometry.x, event.feature.geometry.y), 15);
					singleSelectSearchResults.events.triggerEvent("featuresselected", event);
				}
			}
		});
		 
		layerUserArea.mergeNewParams({'CQL_FILTER': "strToLowerCase(User) = '" + lastUser.toLowerCase() +"' AND strToLowerCase(Collection) = '" + lastCollection.toLowerCase() + "'"});
		geocodeMarkers1 = new OpenLayers.Layer.Vector("Geocode Markers", { displayInLayerSwitcher: false });
		
		var lineLayerStyle = new OpenLayers.StyleMap({
						'strokeColor': '#FFFF00',
						'strokeOpacity': 1,
						'strokeWidth': 3,
						'fillColor': '#FFFF00',
						'fillOpacity': 0.5,
						'pointRadius': 6
		});
		
		lineLayer = new OpenLayers.Layer.Vector("Line Layer",{'displayInLayerSwitcher':false, 'styleMap': lineLayerStyle});
				
		// add layers
		map.addLayers([gphy, layerOSM, gsat, gmap, ghyb, geocodeMarkers1, layerSearchCluster, layerUserArea, layerCarareCached, 
		layerLinkedHeritageCached, layerPartagePlusCached, layerAthenaPlusCached, layerPhotographyCached,layer3DIconsCached, layerAllCached, layerAllCachedCluster, layerAll, lineLayer]);

		
		// Look for the cookie
		if (document.cookie.indexOf(cookiename + "=") !=-1) {
			cookieStart = document.cookie.indexOf(cookiename + "=");
			if (cookieStart!=-1) {
			  cookieStart += cookiename.length+1; 
			  cookieEnd=document.cookie.indexOf(";",cookieStart);
			  if (cookieEnd==-1) {
				cookieEnd=document.cookie.length;
			  }
			  cookietext = document.cookie.substring(cookieStart,cookieEnd);
			}
			var cookietextArray = cookietext.split("|");
			lastUser = cookietextArray[1];
			lastCollection = cookietextArray[2];
			layerUserArea.mergeNewParams({'CQL_FILTER': "strToLowerCase(User) = '" + lastUser.toLowerCase() +"' AND strToLowerCase(Collection) = '" + lastCollection.toLowerCase() + "'"});
			
			var baseMaps = map.getLayersByName(cookietextArray[0]);
			map.setBaseLayer(baseMaps[0]);
		}
		
		// draw line control
		var drawOptions =	{
			'handlerOptions': {
				'style': {
					'strokeColor': '#FFFF00',
					'strokeOpacity': 1,
					'strokeWidth': 3,
					'fillColor': '#FFFF00',
					'fillOpacity': 0.2,
					'pointRadius': 6
				}
			}
		};
	
        drawLineControl = new OpenLayers.Control.DrawFeature(lineLayer,OpenLayers.Handler.Path, drawOptions);
		drawLineControl.events.register("featureadded", this, function (e) {			
			var lineGeometry = e.feature.geometry;
			var output = "";
			for (var i = 0; i < lineGeometry.components.length; i++) {
					var x = lineGeometry.components[i].x.toFixed(1);
					var y = lineGeometry.components[i].y.toFixed(1);
					output += x +','+y+'@'
			}
			if (searchString.length > 1) {
				if (selectedLayerName() == "All") {
					window.open("getLocations/default.aspx?line=" + output + "&TITLE=" + encodeURIComponent(searchString) + "&PROJECT=");
				} else {
					window.open("getLocations/default.aspx?line=" + output + "&TITLE=" + encodeURIComponent(searchString) + "&PROJECT=" +selectedLayerName());
				}
				
			} else {
				if (selectedLayerName() == "All") {
					window.open("getLocations/default.aspx?line=" + output + "&PROJECT=");
				} else {
					window.open("getLocations/default.aspx?line=" + output + "&PROJECT=" + selectedLayerName());
				}
			}
			
			lineLayer.destroyFeatures();
			
		});
		
		// add controls
		map.addControl(drawLineControl);
		
		map.addControl(new OpenLayers.Control.Navigation({
				dragPanOptions : {
					enableKinetic : true,
					kineticInterval : 10
				},
				mouseWheelOptions : { 
					interval: 200,
					cumulative: false,
					delta: 1
				}
			}));
			
		map.addControl(new OpenLayers.Control.PanZoomBar({
			'div' : OpenLayers.Util.getElement('panZoomCont'),
			zoomStopHeight : 6,
			panIcons : false
		}));
			

		map.addControl(new OpenLayers.Control.ScaleLine({
				'maxWidth' : 400
			}));
		map.addControl(new OpenLayers.Control.MousePosition({
				displayProjection : new OpenLayers.Projection('EPSG:4326'),
				emptyString : ''
			}));
		map.addControl(new OpenLayers.Control.LayerSwitcher({
				'div' : OpenLayers.Util.getElement('layerSwitcherCont')
			}));
		map.addControl(new OpenLayers.Control.KeyboardDefaults());
		
		map.events.register("mousemove", map, function (e) {
			var position = this.events.getMousePosition(e);
		});
		
		document.getElementById('searchText1').value = "";
		searchString = "";
		
		// override hardcoded panZoomBar position
		document.getElementById('panZoomCont').style.left = "";
		
		map.events.register('changebaselayer', null, function (evt) {
			document.getElementById('panZoomCont').style.left = "";
		});
		
		// make carare layer transparent at larger scales except for ie9 and lower	
		map.events.register('zoomend', null, function (evt) {	
			if (ieLT9 == false) { 
				setLayerOpacity();	
			}
			
			if (map.getZoom() < 12 && (layerAllCachedCluster.visible != false || layerSearchCluster.visible != false)) {
				if (mobileDevice == true) { 
					singleSelect.clickTolerance = 70;
				} else {
					singleSelect.clickTolerance = 50;
				}
			} else {
				if (mobileDevice == true) { 
					singleSelect.clickTolerance = 50;
				} else {
					singleSelect.clickTolerance = 10;
				}		
			}
		});
		
		// identify points
		identifyPoints();
		identifyUserAreaPoints();
				
		// Get record with the requested ID, zoom to and display in a popup
		if (GetQueryString("ID") != "") {
				
				var jsonFile = new XMLHttpRequest();
				jsonFile.open("GET", ""+JSONserviceURL+"?ID=" + GetQueryString("ID")+"", false);
				jsonFile.send();
				var jsondata = jsonFile.responseText;
				var obj = jQuery.parseJSON(jsondata);
				
				if (jsondata == "{\"IDCArray\":[]}") {
					return;
				} else {
					var Carare_ID = obj.IDCArray[0];
					var pointWGS = new OpenLayers.Geometry.Point(Carare_ID.LON,Carare_ID.LAT);
					var pointSpherical = pointWGS.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
					// zoom to
					map.setCenter(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), 15);
					
					var html  = "<table><tr><td bgcolor='#FFFFFF' style='font-family:Arial;font-size:12px;color:000000;'>";

					html += "<a href='"+ Carare_ID.CONTEXT +"' target='_blank' style='color: rgb(0,0,0)'><img src='"+ Carare_ID.THUMBNAIL +
					"'  style='height:120px;width=100%;border-width:0px;' ></img></a><br /><a href='"+ Carare_ID.CONTEXT +
					"' target='_blank' style='color: rgb(0,0,0)'>"+ Carare_ID.TITLE +"</a>";
					
						html += "</td></tr></table>";
						
					popup = new OpenLayers.Popup.FramedCloud("popup",
							pointSpherical.getBounds().getCenterLonLat(),
							null,
							html,
							null, true, null);
						
					OpenLayers.Popup.FramedCloud.prototype.minSize = new OpenLayers.Size(100, 100);
					OpenLayers.Popup.FramedCloud.prototype.maxSize = new OpenLayers.Size(400, 480);
					map.addPopup(popup);

				}							
		}		
		

		// checkbox default state on load
		document.getElementById("AllCheckbox").checked = true;
		permalinkState[4] = 0;
		document.getElementById("LinkedHeritageCheckbox").checked = false;
		document.getElementById("CarareCheckbox").checked = false;
		document.getElementById("PartagePlusCheckbox").checked = false;
		document.getElementById("AthenaPlusCheckbox").checked = false;
		document.getElementById("PhotographyCheckbox").checked = false;
		document.getElementById("A3DIconsCheckbox").checked = false;
		
		layerAllCached.setVisibility(true);
		layerCarareCached.setVisibility(false);
		layerLinkedHeritageCached.setVisibility(false);
		layerPartagePlusCached.setVisibility(false);
		layerAthenaPlusCached.setVisibility(false);
		layer3DIconsCached.setVisibility(false);
		layerPhotographyCached.setVisibility(false);
				
		if (GetQueryString("TITLE") != "") {
			addSearchResults(GetQueryString("TITLE"), false);
			layerAllCached.setVisibility(false);
			layerCarareCached.setVisibility(false);
			layerLinkedHeritageCached.setVisibility(false);
			layerPartagePlusCached.setVisibility(false);
			layerAthenaPlusCached.setVisibility(false);
			layer3DIconsCached.setVisibility(false);
			layerPhotographyCached.setVisibility(false);
		}
		
		if (GetQueryString("ZOOM") != "" && GetQueryString("LAT") != "" && GetQueryString("LON") != "") {
			var zoom = GetQueryString("ZOOM");
			var lat = GetQueryString("LAT");
			var lon = GetQueryString("LON");
			var pointWGS = new OpenLayers.Geometry.Point(lon, lat);
			var pointSpherical = pointWGS.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
			if (parseInt(zoom) > 15 && gphy.visibility == true) {
				map.setBaseLayer(gmap);
			}
			map.setCenter(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), zoom);
			if (parseInt(zoom) > 13) {
				if (ieLT9 == false) { 
					setLayerOpacity();
				}
			}
			
		}
		
		if (GetQueryString("LAT") != "" && GetQueryString("LON") != "" && GetQueryString("SVIEW") == "YES") {
			var lat = GetQueryString("LAT");
			var lon = GetQueryString("LON");
			var pointWGS = new OpenLayers.Geometry.Point(lon, lat);
			var pointSpherical = pointWGS.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
			map.setCenter(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), 15);
			
			var point = new OpenLayers.Geometry.Point(lon, lat);
			var sv = new google.maps.StreetViewService();
			var streetViewLocation = new google.maps.LatLng(parseFloat(lat),parseFloat(lon)); 
			sv.getPanoramaByLocation(streetViewLocation, 50, function(data, status) {
				if (status == 'OK') {
					var pos = data.location.latLng;
					showGoogleSV(1, point.y, point.x, pos.lat(), pos.lng());

					permalinkState[0] = lon;
					permalinkState[1] = lat;
					permalinkState[7] = 'YES';					
				} else {
					alert("No street view at this location.");
				}
			});
			
			
		}
		
		
		if (GetQueryString("LAYER") != "" /*&& GetQueryString("ID") == ""*/) {
			var project = GetQueryString("LAYER").toLowerCase();
			if (project == 1) {
				changeLayersVis("CarareCheckbox");
				document.getElementById("AllCheckbox").checked = false;
				document.getElementById("LinkedHeritageCheckbox").checked = false;
				document.getElementById("CarareCheckbox").checked = true;
				document.getElementById("PartagePlusCheckbox").checked = false;
				document.getElementById("A3DIconsCheckbox").checked = false;
				document.getElementById("AthenaPlusCheckbox").checked = false;
				document.getElementById("PhotographyCheckbox").checked = false;
			} else if (project == 2) {
				changeLayersVis("LinkedHeritageCheckbox");
				document.getElementById("AllCheckbox").checked = false;
				document.getElementById("LinkedHeritageCheckbox").checked = true;
				document.getElementById("CarareCheckbox").checked = false;
				document.getElementById("PartagePlusCheckbox").checked = false;
				document.getElementById("A3DIconsCheckbox").checked = false;
				document.getElementById("AthenaPlusCheckbox").checked = false;
				document.getElementById("PhotographyCheckbox").checked = false;
			} else if (project == 3) {
				changeLayersVis("PartagePlusCheckbox");
				document.getElementById("AllCheckbox").checked = false;
				document.getElementById("LinkedHeritageCheckbox").checked = false;
				document.getElementById("CarareCheckbox").checked = false;
				document.getElementById("PartagePlusCheckbox").checked = true;
				document.getElementById("A3DIconsCheckbox").checked = false;
				document.getElementById("AthenaPlusCheckbox").checked = false;
				document.getElementById("PhotographyCheckbox").checked = false;
			} else if (project == 5) {
				changeLayersVis("AthenaPlusCheckbox");
				document.getElementById("AllCheckbox").checked = false;
				document.getElementById("LinkedHeritageCheckbox").checked = false;
				document.getElementById("CarareCheckbox").checked = false;
				document.getElementById("PartagePlusCheckbox").checked = false;
				document.getElementById("A3DIconsCheckbox").checked = false;
				document.getElementById("AthenaPlusCheckbox").checked = true;
				document.getElementById("PhotographyCheckbox").checked = false;
			} else if (project == 4) {
				changeLayersVis("A3DIconsCheckbox");
				document.getElementById("AllCheckbox").checked = false;
				document.getElementById("LinkedHeritageCheckbox").checked = false;
				document.getElementById("CarareCheckbox").checked = false;
				document.getElementById("PartagePlusCheckbox").checked = false;
				document.getElementById("AthenaPlusCheckbox").checked = true
				document.getElementById("A3DIconsCheckbox").checked = false;
				document.getElementById("PhotographyCheckbox").checked = false;
			} else if (project == 7) {
				changeLayersVis("PhotographyCheckbox");
				document.getElementById("AllCheckbox").checked = false;
				document.getElementById("LinkedHeritageCheckbox").checked = false;
				document.getElementById("CarareCheckbox").checked = false;
				document.getElementById("PartagePlusCheckbox").checked = false;
				document.getElementById("AthenaPlusCheckbox").checked = false
				document.getElementById("A3DIconsCheckbox").checked = false;
				document.getElementById("PhotographyCheckbox").checked = true;
			}
		}
		
		
		//show popup
		if (GetQueryString("THUMB") == "YES") {

			
			var clickbbox = GetQueryString("CLICKBBOX");
			var clickboxarray = GetQueryString("CLICKBBOX").split(',');
			/*
			var polyVertex = [];
			polyVertex.push(new OpenLayers.Geometry.Point(clickboxarray[0],clickboxarray[1]));
			polyVertex.push(new OpenLayers.Geometry.Point(clickboxarray[2],clickboxarray[1]));
			polyVertex.push(new OpenLayers.Geometry.Point(clickboxarray[2],clickboxarray[3]));
			polyVertex.push(new OpenLayers.Geometry.Point(clickboxarray[0],clickboxarray[3]));
			var poly = new OpenLayers.Geometry.LinearRing(polyVertex);
			var centroid = poly.getCentroid();
		*/
			//var centroid = new OpenLayers.Geometry.Point(parseFloat(GetQueryString("LON")),parseFloat(GetQueryString("LAT")))
			
			// get number of items to set popup size
			QueryString = "";

			var validFeatures = 0;

				
			QueryString = "PROJECT=" + selectedLayerName();
			if (selectedLayerName() == "All") {QueryString = "PROJECT=";}
			if (GetQueryString("TITLE") != "") {QueryString += "&searchString=" + GetQueryString("TITLE");}
			
			QueryString += "&bbox=" + clickbbox;
			var jsonFile = new XMLHttpRequest();
			jsonFile.open("GET", ""+JSONserviceURL+"?" + QueryString, false);
			jsonFile.send();
			var jsondata = jsonFile.responseText;
			var obj = jQuery.parseJSON(jsondata);
			validFeatures = obj.IDCArray[0].IDCcount;
			
			if (validFeatures == 0) {
				return;
			}
			var popupHeight = 143;
			var popupWidth = 350;
			if (validFeatures > 6) {
				popupHeight = 380;
			} else if (validFeatures > 3) {
				popupHeight = 260;
			} else if (validFeatures < 2) {
				popupHeight = 143;
				popupWidth = 110;
			} else if (validFeatures < 3) {
				popupHeight = 143;
				popupWidth = 220;
			}
			
			var pointWGS = new OpenLayers.Geometry.Point(parseFloat(GetQueryString("LON")),parseFloat(GetQueryString("LAT")));
			var point = pointWGS.clone().transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
			//pointWGS = pointWGS.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			
			var streetviewDiv = "<div id='streetviewlink' style='position:absolute;left:40px;bottom:3px;height:12px;cursor:pointer;text-decoration:underline;font-size:11px;' ></div>";			
			var sv = new google.maps.StreetViewService();
			var streetViewLocation = new google.maps.LatLng(pointWGS.y,pointWGS.x);
			sv.getPanoramaByLocation(streetViewLocation, 50, function(data, status) {
				if (status == 'OK') {
					var pos = data.location.latLng;
					document.getElementById("streetviewlink").onclick = function (){ 
							showGoogleSV(1, pointWGS.y, pointWGS.x, pos.lat(), pos.lng());
							
							permalinkState[0] = pointWGS.x;
							permalinkState[1] = pointWGS.y;
							permalinkState[7] = 'YES';
							
							closePopup();
						};
					document.getElementById('streetviewlink').innerHTML = 'street view';						
				}
			});
			var eCultureMapDiv = "<img style='position:absolute;left:10px;top:0px;height:14px;' src='img/e-culture-map.jpg' />";	
			var html = eCultureMapDiv + streetviewDiv +"<iframe id='gridview' name='gridview' scrolling='no' frameBorder='0' width='" + popupWidth + "' height='" + popupHeight + "' src='gallery/Default.aspx?IDC=0&" + QueryString +"'></iframe>";
			
			popup = new OpenLayers.Popup.FramedCloud("popup",
					new OpenLayers.LonLat(point.x,point.y),
					null,
					html,
					null, true, closePopup);
			
			OpenLayers.Popup.FramedCloud.prototype.minSize = new OpenLayers.Size(100, 100);
			OpenLayers.Popup.FramedCloud.prototype.maxSize = new OpenLayers.Size(400, 480);
			map.addPopup(popup);
			
			popup.setSize(new OpenLayers.Size(popupWidth, 5+popupHeight));
			
			/*
			if (mobileDevice == true) {} else {
				document.getElementById('popup_contentDiv').style.height = (popupHeight + 10) + 'px';
				popup.updateSize();
			}
			*/
			
			permalinkState[0] = pointWGS.x;
			permalinkState[1] = pointWGS.y;
			permalinkState[5] = 'YES';
			permalinkState[6] = clickbbox;
			

			
		}
		

		
	//Geocode tool
		var findLocationInput = document.getElementById('locationInputField');	
        var autocomplete = new google.maps.places.Autocomplete(findLocationInput);
		
		google.maps.event.addListener(autocomplete, 'place_changed', function() {
          findLocationInput.className = '';
          var place = autocomplete.getPlace();
          if (!place.geometry) {
            findLocationInput.className = 'notfound';
            return;
          } else {
		  
				while (map.popups.length) {
					map.removePopup(map.popups[0]);
				}
				if (geocodeMarkers != null) {
					geocodeMarkers.clearMarkers();
				} else {
					geocodeMarkers = new OpenLayers.Layer.Markers("Geocode Markers", { displayInLayerSwitcher: false });
					map.addLayer(geocodeMarkers);
				}
				if (map.baseLayer == gphy || map.baseLayer == layerOSM) {
					map.setBaseLayer(gmap);
				}
                var lon, lat;
                lon = place.geometry.location.lng();
                lat = place.geometry.location.lat();
                var pointWGS = new OpenLayers.Geometry.Point(lon, lat);
                var pointSpherical = pointWGS.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

                var iconSize = new OpenLayers.Size(32, 32);
                var iconOffset = new OpenLayers.Pixel(-5, -30);
                var markerIcon = new OpenLayers.Icon('img/location_pin.png', iconSize, iconOffset);
                geocodeMarkers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), markerIcon));
                map.setCenter(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), 17);
			    var address = '';
			    if (place.address_components) {
					address = [
					(place.address_components[0] && place.address_components[0].short_name || ''),
					(place.address_components[1] && place.address_components[1].short_name || ''),
					(place.address_components[2] && place.address_components[2].short_name || '')
					].join(' ');
				}
				
			  	html = '<div><strong>' + place.name + '</strong><br></div>' + address;

				popup = new OpenLayers.Popup.FramedCloud("popup",
						pointSpherical.getBounds().getCenterLonLat(),
						null,
						html,
						null, true, null);
				
				OpenLayers.Popup.FramedCloud.prototype.minSize = new OpenLayers.Size(100, 100);
				OpenLayers.Popup.FramedCloud.prototype.maxSize = new OpenLayers.Size(400, 480);
				map.addPopup(popup);
		  }
        });
		
		
		addPointControl = new OpenLayers.Control.DrawFeature(geocodeMarkers1,OpenLayers.Handler.Point, drawOptions);
		
		addPointControl.events.register("featureadded", this, function (e) {			
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
			}
			var point =  e.feature.geometry;
			var popupLocation = e.feature.geometry.clone();
			var pointWGS = point.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			var queryString = "Lat=" + pointWGS.y + "&Lon=" + pointWGS.x;
			updateUserAreaPoint = pointWGS;
			
			var typeField;
			typeField = currentType;
			if (currentType == "&nbsp;") {
				typeField = lastType;
			} else {
				typeField = currentType;
			}
			
			
			var html = '<table class="formstyle">';
			html += '<tr><td>Remarks</td></tr>'
			html += '<tr><td><textarea id="formTextArea" autofocus autofocus="autofocus" required="required" style="width:22em;height:2.5em;background-color:#fafafa;border-radius:3px;border:1px solid #a9a9a9;resize:none;"></textarea></td></tr>';
			html += '<tr><td>PlaceName</td></tr>'
			html += '<tr><td><textarea id="formPlaceName" autofocus autofocus="autofocus" style="width:22em;height:2.5em;background-color:#fafafa;border-radius:3px;border:1px solid #a9a9a9;resize:none;">' + lastPlaceName + '</textarea></td></tr>';
			html += '<tr><td>Accuracy</td></tr>'
			html += '<tr><td><input type="text" id="formAccuracy" value="1" style="width:2em;background-color:#fafafa;border-radius:3px;border:1px solid #a9a9a9;resize:none;"></td></tr>';
			html += '<tr><td>Type</td></tr>'
			html += '<tr><td><input type="text" id="formType" value="' + typeField + '" style="width:4em;background-color:#fafafa;border-radius:3px;border:1px solid #a9a9a9;resize:none;"></td></tr>';
			html += '<tr><td>Update all records with the same PlaceName</td></tr>';
			html += '<tr><td><input id="formCheckbox" type="checkbox" name="Update"></td></tr>';
			html += '<tr><td><input type="button" class="formButton" id="Submit" value="Submit" Width="100px" onclick="updateUserAreaLocation($(\'#formTextArea\').val(),$(\'#formAccuracy\').val(),$(\'#formType\').val(),$(\'#formCheckbox:checked\').val(),$(\'#formPlaceName\').val())" /></td></tr>';
			html += '</table>';	
			
			popup = new OpenLayers.Popup.FramedCloud("bufferPopup",
					popupLocation.getBounds().getCenterLonLat(),
					null,
					html,
					null, true, null);
			
			OpenLayers.Popup.FramedCloud.prototype.minSize = new OpenLayers.Size(180, 260);
			OpenLayers.Popup.FramedCloud.prototype.maxSize = new OpenLayers.Size(400, 480);
			map.addPopup(popup);
			
		});
		
		map.addControl(addPointControl);
		
		
		var drawOptionsSV =	{
			'handlerOptions': {
				'style': {
					'externalGraphic': 'img/pegmanActive.png',
					'graphicWidth': 33
				}
			}
		};
		
		googleSVpoint = new OpenLayers.Control.DrawFeature(geocodeMarkers1,OpenLayers.Handler.Point, drawOptionsSV);
		
		googleSVpoint.events.register("featureadded", this, function (e) {			
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
			}
			var point =  e.feature.geometry;
			var popupLocation = e.feature.geometry.clone();
			var pointWGS = point.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			
			geocodeMarkers1.removeAllFeatures();
						
			var sv = new google.maps.StreetViewService();
			var streetViewLocation = new google.maps.LatLng(pointWGS.y,pointWGS.x);
			sv.getPanoramaByLocation(streetViewLocation, 50, function(data, status) {
				if (status == 'OK') {
					showGoogleSV(1, pointWGS.y, pointWGS.x, pointWGS.y, pointWGS.x);					
				} else {
					alert("No street view at this location.");
				}
			});
			
			
			
			toggleGoogleSVPegman();
			
		});
		
		map.addControl(googleSVpoint);
		
		
		//listener for UserArea messages
		
		function listener(event) {
			if (event.origin !== "http://athenaplus2.eculturelab.eu")
				return;
			
			//parse receieved postmessege 
			var returnedData = event.data.split("|");
			lastgid = returnedData[1];
			lastPlaceName =  decodeURIComponent(returnedData[2]);
			lastPlaceName = lastPlaceName.replace(/\+/g, " ");
			lastUser = decodeURIComponent(returnedData[3]);
			lastUser = lastUser.replace(/\+/g, " ");
			lastCollection = decodeURIComponent(returnedData[4]);
			lastCollection = lastCollection.replace(/\+/g, " ");
			document.getElementById('userAreaTopBar').style.display = 'block';
			
			//update UserArea map and identify
			layerUserArea.mergeNewParams({'CQL_FILTER': "strToLowerCase(User) = '" + lastUser.toLowerCase() +"' AND strToLowerCase(Collection) = '" + lastCollection.toLowerCase() + "'"});
			layerUserArea.redraw(true);
	
			userAreaSelect.protocol.defaultFilter.filters[0].value = lastUser.toLowerCase();
			userAreaSelect.protocol.defaultFilter.filters[1].value = lastCollection.toLowerCase();
			
			//show user area layer
			document.getElementById("UserAreaCheckbox").checked = true;
			changeLayersVis('UserAreaCheckbox');		
			
			var lon, lat, type, accuracy, pointWGS, pointSpherical, iconSize, iconOffset, markerIcon, title, thumbnail, context, contextg;
			var placeArray = lastPlaceName.split(", ");	
			
			if (returnedData[0] == "Zoom") {
				//clear previous markers
				if (geocodeMarkers != null) {
					geocodeMarkers.clearMarkers();
				} else {
					geocodeMarkers = new OpenLayers.Layer.Markers("Geocode Markers", { displayInLayerSwitcher: false });
					map.addLayer(geocodeMarkers);
				}
				//zoom to coordinates
				toggleUserAreaWindow2();
				
				//transfer only street address and settlement to google wiget		
				document.getElementById('locationInputField').value = placeArray[0] + ', ' + placeArray[1] + ', ' + placeArray[2];
				
				lon = returnedData[5];
				lat = returnedData[6];
				type = returnedData[7];
				accuracy = returnedData[8];
				title = decodeURIComponent(returnedData[9]).replace(/\+/g, " ");		
				thumbnail = returnedData[10];
				context = returnedData[11];
				contextg = returnedData[12];
				currentType = type;
				if (lon != "&nbsp;") {
				
					pointWGS = new OpenLayers.Geometry.Point(lon,lat);
					pointSpherical = pointWGS.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
				
					iconSize = new OpenLayers.Size(32, 32);
					iconOffset = new OpenLayers.Pixel(-5, -30);
					markerIcon = new OpenLayers.Icon('img/location_pin.png', iconSize, iconOffset);
					geocodeMarkers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), markerIcon));
					if (accuracy != 10) {
						map.setCenter(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), 15);
					} else {
						map.setCenter(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), 12);
					}
					
					// make userAreaItemPreview visible and fill it
					var userAreaItemPreviewDiv = document.getElementById("userAreaItemPreview");
					userAreaItemPreviewDiv.style.height = "";
					userAreaItemPreviewDiv.style.display = 'block';
					userAreaItemPreviewDiv.innerHTML = '<div onclick="closeUserAreaItemPreviewDiv();" style="cursor:pointer;z-index:1002;position:absolute;right:5px;top:5px;" ><img src="img/close.gif" style="border: none;" title="Close item preview"></div>';
					userAreaItemPreviewDiv.innerHTML += '<div><img src="'+ thumbnail +'" alt="'+ title +'" style="width:250px;max-height:250px;"><div style="cursor:pointer;position:absolute;left:5%;top:0px;height:50%;width:95%" onclick="window.open(\''+ context +'\', \'_blank\');"></div><div style="cursor:pointer;position:absolute;left:5%;top:50%;height:50%;width:95%" onclick="window.open(\''+ contextg +'\', \'_blank\');"></div></div>';
					userAreaItemPreviewDiv.innerHTML += '<div style="position:relative;left:0px;width: 250px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;background-color: white;" title="'+ title +'">' + title + '</div>';
					userAreaItemPreviewDiv.innerHTML += '<div style="position:relative;left:0px;width: 250px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;background-color: white;" title="'+ lastPlaceName +'">' + lastPlaceName + '</div>';
					
					
				}
				//Show location update button
				document.getElementById("updateLocationButton").style.display = 'block';
			}		
			if (returnedData[0] == "Update") {
				toggleUserAreaWindow2();							
				document.getElementById('locationInputField').value = placeArray[1] + ', ' + placeArray[2];
				//Show location update button
				document.getElementById("updateLocationButton").style.display = 'block';
				
				lon = returnedData[5];
				lat = returnedData[6];
				type = returnedData[7];
				if (type != "&nbsp;") {currentType = type;}
				
				if (lon != "&nbsp;") {			
					if (geocodeMarkers != null) {
						geocodeMarkers.clearMarkers();
					} else {
						geocodeMarkers = new OpenLayers.Layer.Markers("Geocode Markers", { displayInLayerSwitcher: false });
						map.addLayer(geocodeMarkers);
					}
					pointWGS = new OpenLayers.Geometry.Point(lon,lat);
					pointSpherical = pointWGS.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
				
					iconSize = new OpenLayers.Size(32, 32);
					iconOffset = new OpenLayers.Pixel(-5, -30);
					markerIcon = new OpenLayers.Icon('img/location_pin.png', iconSize, iconOffset);
					geocodeMarkers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), markerIcon));
					map.setCenter(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), 12);
				} else {
					var bbox = new OpenLayers.Bounds(-4500000, 3050000, 7500000, 9800000);
					map.zoomToExtent(bbox);
					if (geocodeMarkers != null) {
						geocodeMarkers.clearMarkers(); 
					}
				}
				
			}
			if (returnedData[0] == "Show") {			
				lastgid = 0;
				lastPlaceName =  "";
				var bboxShow;
				if (returnedData[5].length > 1) {
					var returnedBbox = returnedData[5].split(",");
					bboxShow = new OpenLayers.Bounds(returnedBbox[0], returnedBbox[1], returnedBbox[2], returnedBbox[3]);
					bboxShow = bboxShow.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
				} else {
					bboxShow = new OpenLayers.Bounds(-4500000, 3050000, 7500000, 9800000);
				}
				map.zoomToExtent(bboxShow);
				setCookie();
			}
			if (returnedData[0] == "UserAreaLoginSucc") {			
				lastgid = 0;
				lastPlaceName =  "";
				document.getElementById('TopBarRightDiv').style.right = "0px";
				if (lastCollection == "share") {
					//display and create capture controls for share
					document.getElementById("captureButtons").style.display = 'block';
					createShareCaptureControls();
				} else {
					document.getElementById("captureButtons").style.display = 'none';
				}
				setCookie();
			}
		}

		if (window.addEventListener) {
			addEventListener("message", listener, false);
		} 
		else {
			attachEvent("onmessage", listener);
		}
		

		
		//turn off google maps tilt
		ghyb.mapObject.setTilt(0);
		gsat.mapObject.setTilt(0);
		
	
		lastCoordinates = map.getCenter().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
		lastZoom = map.zoom;

	
		map.events.register('moveend', null, function (evt) {
			lastCoordinates = map.getCenter().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			lastZoom = map.zoom;
			permalinkState[2] = lastZoom;
			if (map.popups.length == 0) {
				permalinkState[0] = lastCoordinates.lon;
				permalinkState[1] = lastCoordinates.lat;
				
			}

			var projectMapExtent = "";
			if (selectedLayerName() == "All") {projectMapExtent = "";} else { projectMapExtent = "@" + selectedLayerName();}
			document.getElementById("mapExtent").value = map.getExtent().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")) + projectMapExtent;
			
			var currentExtent = map.getExtent().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			
			var searchResultsVisible = false;
			if (layerSearchResult != null) {
				if (layerSearchResult.visibility == true) {
					searchResultsVisible = true;
				}
			}
			if (searchResultsVisible == false && layerUserArea.visibility == false) {
				layerAllCachedCluster.setVisibility(true);
				//cluster layer select
				var geoserverClusterLayer;
				if (permalinkState[4] == 0) {
					geoserverClusterLayer = "MC_Cen4_c_view";
				} else if (permalinkState[4] == 1) {
					geoserverClusterLayer = "MC_Cen4_c_Carare_view";
				} else if (permalinkState[4] == 2) {
					geoserverClusterLayer = "MC_Cen4_c_Linked_view";
				} else if (permalinkState[4] == 3) {
					geoserverClusterLayer = "MC_Cen4_c_Partage_view";
				} else if (permalinkState[4] == 5) {
					geoserverClusterLayer = "MC_Cen4_c_Athena_view";
				} else if (permalinkState[4] == 4) {
					geoserverClusterLayer = "MC_Cen4_c_3DIcons_view";
				} else if (permalinkState[4] == 7) {
					geoserverClusterLayer = "MC_Cen4_c_Photography_view";
				}
				
				layerAllCachedCluster.mergeNewParams({layers : "PostGIS:" + geoserverClusterLayer }); 
								
					
				if (map.zoom > 11) {
					if (ieLT9 == false) { 
						setLayerOpacity();	
					}
				} 		
			} else {
				//hide cluster when search results visible
				layerAllCachedCluster.setVisibility(false);
			}


			
			
			
			
			if (searchResultsVisible == true) {
			
				var clusterSelect = new OpenLayers.Control.SelectFeature([layerSearchCluster]);
				clusterSelect.id = 'clusterSelect';
				var clusterSelectControls = map.getControlsBy("id", "clusterSelect");
				for (var i = 0; i < clusterSelectControls.length; i++) {
					map.removeControl(clusterSelectControls[i]);
				}
				map.addControl(clusterSelect);
		
				if (map.zoom < 12) {				
					singleSelectSearchResults.deactivate();
					clusterSelect.activate();
				} else {
					singleSelectSearchResults.activate();
					clusterSelect.deactivate();
				}
				
			}
			
		});
		
		map.events.register('changelayer', null, function (evt) {
			if (evt.layer.name == "All" || evt.layer.name == "All1" || evt.layer.name == "All2") {
				if (layerAllCached.visibility == true) {
					permalinkState[4] = 0;
				}
			} else if (evt.layer.name == "Carare" || evt.layer.name == "Carare1" || evt.layer.name == "Carare2") {		
				if (layerCarareCached.visibility == true) {
					permalinkState[4] = 1;
				}
			} else if (evt.layer.name == "Linked Heritage" || evt.layer.name == "LinkedHeritage1" || evt.layer.name == "LinkedHeritage2") {		
				if (layerLinkedHeritageCached.visibility == true) {
					permalinkState[4] = 2;
				}
			} else if (evt.layer.name == "Partage Plus" || evt.layer.name == "PartagePlus1" || evt.layer.name == "PartagePlus2") {		
				if (layerPartagePlusCached.visibility == true) {
					permalinkState[4] = 3;
				}
			} else if (evt.layer.name == "Athena Plus" || evt.layer.name == "AthenaPlus1" || evt.layer.name == "AthenaPlus2") {		
				if (layerAthenaPlusCached.visibility == true) {
					permalinkState[4] = 5;
				}
			} else if (evt.layer.name == "User Area") {		
				if (layerUserArea.visibility == true) {
					permalinkState[4] = 6;
				}
			} else if (evt.layer.name == "3DIcons" || evt.layer.name == "3DIcons1" || evt.layer.name == "3DIcons2") {		
				if (layer3DIconsCached.visibility == true) {
					permalinkState[4] = 4;
				}
			} else if (evt.layer.name == "Photography" || evt.layer.name == "Photography1" || evt.layer.name == "Photography2") {		
				if (layerPhotographyCached.visibility == true) {
					permalinkState[4] = 7;
				}
			}
			//layerAllCachedCluster.redraw(true);
			var projectMapExtent = "";
			if (selectedLayerName() == "All") {projectMapExtent = "";} else { projectMapExtent = "@" + selectedLayerName();}
			document.getElementById("mapExtent").value = map.getExtent().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")) + projectMapExtent;
		});
		
		permalinkState[0] = map.getCenter().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")).lon;
		permalinkState[1] = map.getCenter().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")).lat;
		permalinkState[2] = map.zoom;
		
		$(document).keyup(function(e) {
			if (e.shiftKey && e.keyCode == 80) {
				var permalink = window.location.href.split('?')[0];
				
				if (permalinkState[5] == 'YES') { //if thumbnail yes
					permalink += '?LON=' + permalinkState[0];
					permalink += '&LAT=' + permalinkState[1];
					permalink += '&ZOOM=' + permalinkState[2];
					permalink += '&LAYER=' + permalinkState[4];
					permalink += '&THUMB=' + permalinkState[5];
					permalink += '&CLICKBBOX=' + permalinkState[6];
					if (permalinkState[3] != null) {
						permalink += '&TITLE=' + permalinkState[3];
					}				
				} else if (permalinkState[7] == 'YES') { // if streetview
					permalink += '?LON=' + permalinkState[0];
					permalink += '&LAT=' + permalinkState[1];
					permalink += '&ZOOM=' + permalinkState[2];
					permalink += '&LAYER=' + permalinkState[4];
					permalink += '&SVIEW=' + permalinkState[7];
				} else {
					permalink += '?LON=' + permalinkState[0];
					permalink += '&LAT=' + permalinkState[1];
					permalink += '&ZOOM=' + permalinkState[2];
					permalink += '&LAYER=' + permalinkState[4];
					if (permalinkState[3] != null) {
						permalink += '&TITLE=' + permalinkState[3];
					}
				}
				document.getElementById("permalinkURI").innerHTML = permalink;
				document.getElementById("permalinkDiv").style.display = 'block';

			}
		});
		map.events.triggerEvent("moveend");
		var nativeNav = map.getControlsByClass("OpenLayers.Control.Navigation")[0];
		map.removeControl(nativeNav);
	} // END CarareInit
	
	// HTML 5 Geolocation function for mobile devices only
	function showPosition(position) {
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		var pointWGS = new OpenLayers.Geometry.Point(longitude,latitude);
		var pointSpherical = pointWGS.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
		initialCenter = new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y);
		CarareInit();
		// change basemap to open street map	
		var baseMaps = map.getLayersByName("Open Street Map");
		map.setBaseLayer(baseMaps[0]);
		// zoom to
		map.setCenter(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), 16);
		// add marker at found position		
		markers = new OpenLayers.Layer.Markers("HTML5 Geolocation",{displayInLayerSwitcher : false});
		map.addLayer(markers);
		
        var iconSize = new OpenLayers.Size(32, 32);
       //var iconOffset = new OpenLayers.Pixel(0, 16);
        var markerIcon = new OpenLayers.Icon('img/location_pin.png', iconSize/*, iconOffset*/);
		//var marker = new OpenLayers.LonLat((pointSpherical.x, pointSpherical.y),markerIcon);
		markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(pointSpherical.x, pointSpherical.y), markerIcon));
		toggledrawLine();
    }
	
	function showPositionError(error) {	
		document.getElementById("alertDiv").style.display = 'block';
		CarareInit();
    }
	
	function selectedLayerName() {
		var sellay = "";

		if (document.getElementById("AllCheckbox").checked == true) {sellay = "All";}
		if (document.getElementById("CarareCheckbox").checked == true) {sellay = "Carare";}
		if (document.getElementById("LinkedHeritageCheckbox").checked == true) {sellay = "Linked Heritage";} 
		if (document.getElementById("PartagePlusCheckbox").checked == true) {sellay = "Partage Plus";}	
		if (document.getElementById("AthenaPlusCheckbox").checked == true) {sellay = "Athena Plus";}		
		if (document.getElementById("A3DIconsCheckbox").checked == true) {sellay = "3DIcons";}			
		if (document.getElementById("PhotographyCheckbox").checked == true) {sellay = "Photography";}
		return sellay;
	}
	
	function selectedLayer() {
		var sellay = map.getLayersByName(selectedLayerName())[0];

		return sellay;
	}
	
	// identify
	function identifyPoints() {
		
		singleSelect = new OpenLayers.Control.GetFeature({
				protocol : new OpenLayers.Protocol.WFS({
					version : "1.1.0",
					url : geoserverLocation + "/PostGIS/wfs",
					featureNS : featureNS,
					geometryName : "geom",
					maxFeatures : 10,
					featureType : geoserverAllLayer,
					srsName : 'EPSG:900913'
				}),
				clickTolerance : 10,
				single : false,
				clickout : true		
			});
		singleSelect.id = "singleSelect";
		
		//singleSelect event for feature selected
		singleSelect.events.register("featuresselected", this, function (e) {
			/*
			if (e.features[0].attributes.records != "1" &&  map.getZoom() < 12) {
				map.panTo(e.features[0].geometry.getBounds().getCenterLonLat());
				return;
			}
			*/
			var clickbbox = singleSelect.pixelToBounds(e.object.handlers.click.first.xy);
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
			}
			
		
			// get number of items to set popup size
			QueryString = "";
			if (document.getElementById('searchText1').value.length > 0) {
				searchString = document.getElementById('searchText1').value
			}
			var IDCArray = new Array();
			var validFeatures = 0;
			
			for (var i = 0; i < e.features.length; i++) {
				IDCArray[i] = e.features[i].attributes.IDC;
			}
			
			if (IDCArray.length > 100) {
				IDCArray.length = 100;
			}
			/*
			var IDCstring = IDCArray[0];
			for (var i = 1; i < IDCArray.length; i++) {
				if (IDCArray[i - 1] != IDCArray[i]) {
					IDCstring += "." + IDCArray[i]
				}
			}
			*/
			var IDCstring = "0";
			QueryString = "IDC=" + IDCstring + "&PROJECT=" +selectedLayerName();
			if (selectedLayerName() == "All") {QueryString = "IDC=" + IDCstring + "&PROJECT=";}
			QueryString += "&bbox=" + clickbbox;
			var jsonFile = new XMLHttpRequest();
			jsonFile.open("GET", ""+JSONserviceURL+"?" + QueryString, false);
			jsonFile.send();
			var jsondata = jsonFile.responseText;
			var obj = jQuery.parseJSON(jsondata);
			validFeatures = obj.IDCArray[0].IDCcount;
			
			if (validFeatures == 0) {
				return;
			}
			//click on cluster with more than 1 object
			if (validFeatures != "1" &&  map.getZoom() < 12) {
				//map.panTo(e.features[0].geometry.getBounds().getCenterLonLat());
				//var clickcoords = map.getLonLatFromPixel(e.object.handlers.click.first.xy);
				map.setCenter(map.getLonLatFromPixel(e.object.handlers.click.first.xy), map.getZoom()+3)
				//map.zoomIn();
				return;
			}
			var popupHeight = 143;
			var popupWidth = 350;
			if (validFeatures > 6) {
				popupHeight = 380;
			} else if (validFeatures > 3) {
				popupHeight = 260;
			} else if (validFeatures < 2) {
				popupHeight = 143;
				popupWidth = 110;
			} else if (validFeatures < 3) {
				popupHeight = 143;
				popupWidth = 220;
			}
			
			var pointWGS = e.features[0].geometry.clone();
			pointWGS = pointWGS.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			
			var streetviewDiv = "<div id='streetviewlink' style='position:absolute;left:40px;bottom:7px;height:12px;cursor:pointer;text-decoration:underline;font-size:11px;' ></div>";			
			var sv = new google.maps.StreetViewService();
			var streetViewLocation = new google.maps.LatLng(pointWGS.y,pointWGS.x);
			sv.getPanoramaByLocation(streetViewLocation, 50, function(data, status) {
				if (status == 'OK') {
					var pos = data.location.latLng;
					document.getElementById("streetviewlink").onclick = function (){ 
							showGoogleSV(1, pointWGS.y, pointWGS.x, pos.lat(), pos.lng());
							
							permalinkState[0] = pointWGS.x;
							permalinkState[1] = pointWGS.y;
							permalinkState[7] = 'YES';
							
							closePopup();
						};
					document.getElementById('streetviewlink').innerHTML = 'street view';						
				}
			});
			//var eCultureMapDiv = "<div><img src='img/e-culture-map.jpg' /></div>";
			var eCultureMapDiv = "<img style='position:absolute;left:10px;top:0px;height:14px;' src='img/e-culture-map.jpg' />";

			var html = eCultureMapDiv + streetviewDiv +"<iframe id='gridview' name='gridview' scrolling='no' frameBorder='0' width='" + popupWidth + "' height='" + popupHeight + "' src='gallery/Default.aspx?" + QueryString +"'></iframe>";

			
			popup = new OpenLayers.Popup.FramedCloud("popup",
					e.features[0].geometry.getBounds().getCenterLonLat(),
					null,
					html,
					null, true, closePopup);
			
			
			
			OpenLayers.Popup.FramedCloud.prototype.minSize = new OpenLayers.Size(100, 100);
			OpenLayers.Popup.FramedCloud.prototype.maxSize = new OpenLayers.Size(400, 480);
			map.addPopup(popup);
			
			popup.setSize(new OpenLayers.Size(popupWidth, 5+popupHeight));
			/*
			if (mobileDevice == true) {} else {
				document.getElementById('popup_contentDiv').style.height = (popupHeight + 10) + 'px';
				popup.updateSize();
			}
			*/
			
			/*
			document.getElementById('popup').style.height = '450px';
			popup.contentDiv.clientHeight = 450;
			popup.contentDiv.offsetHeight = 450;
			
		
			*/
			permalinkState[0] = pointWGS.x;
			permalinkState[1] = pointWGS.y;
			permalinkState[5] = 'YES';
			permalinkState[6] = clickbbox;
				
			
			
			
			
			
			
		});
		singleSelect.events.register("clickout", this, function (e) {
			
			if (map.getZoom() < 12 && layerAllCachedCluster.visibility == true) {			
				var clickXY = e.object.handlers.click.first.xy;
				map.setCenter(map.getLonLatFromPixel(clickXY), map.getZoom()+3)
				//map.panTo(map.getLonLatFromPixel(clickXY));
				//map.zoomIn();
				return;
			}
			

		});
		//singleSelect event for feature is unselected
		singleSelect.events.register("featureunselected", this, function (e) {
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
				popup.destroy();
			}
		});
		
		map.addControl(singleSelect);
		singleSelect.activate();
		
	};
	// identify
	function identifyUserAreaPoints() {
		
		var filt = new OpenLayers.Filter.Logical({
			type: OpenLayers.Filter.Logical.AND,
			filters: [
				new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.EQUAL_TO,
					matchCase: false,
					property: "User",
					value: lastUser
				}),
				new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.EQUAL_TO,
					matchCase: false,
					property: "Collection",
					value: lastCollection
				})
			]
		});
		
		userAreaSelect = new OpenLayers.Control.GetFeature({
				protocol : new OpenLayers.Protocol.WFS({
					version : "1.1.0",
					url : geoserverLocation + "/PostGIS/wfs",
					featureNS : featureNS,
					geometryName : "geom",
					maxFeatures : 100,
					featureType : geoserverUserAreaLayer,
					srsName : 'EPSG:900913',
					defaultFilter: filt
				}),
				clickTolerance : 10,
				single : false,
				clickout : true							
			});
		userAreaSelect.id = "userAreaSelect";
		
		//userAreaSelect event for feature selected
		userAreaSelect.events.register("featuresselected", this, function (e) {
		
			var clickbbox = singleSelect.pixelToBounds(e.object.handlers.click.first.xy);
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
			}

			// get number of items to set popup size
			QueryString = "";
			if (document.getElementById('searchText1').value.length > 0) {
				searchString = document.getElementById('searchText1').value
			}
			var IDCArray = new Array();
			var validFeatures = 0;
			
			for (var i = 0; i < e.features.length; i++) {
				IDCArray[i] = e.features[i].attributes.gid;
			}
			
			if (IDCArray.length > 500) {
				IDCArray.length = 500;
			}
			var IDCstring = IDCArray[0];
			for (var i = 1; i < IDCArray.length; i++) {
				if (IDCArray[i - 1] != IDCArray[i]) {
					IDCstring += "." + IDCArray[i]
				}
			}
			
			QueryString = "ID=" + IDCstring;
			QueryString += "&User=" + encodeURIComponent(lastUser) + "&Collection=" + encodeURIComponent(lastCollection) + "&bbox=" + clickbbox;

			validFeatures = IDCArray.length;
			
			if (validFeatures == 0) {
				return;
			}
			var popupHeight = 143;
			var popupWidth = 350;
			if (validFeatures > 6) {
				popupHeight = 380;
			} else if (validFeatures > 3) {
				popupHeight = 260;
			} else if (validFeatures < 2) {
				popupHeight = 143;
				popupWidth = 110;
			} else if (validFeatures < 3) {
				popupHeight = 143;
				popupWidth = 220;
			}
			
			var pointWGS = e.features[0].geometry.clone();
			pointWGS = pointWGS.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			
			var streetviewDiv = "<div id='streetviewlink' style='position:absolute;left:40px;bottom:3px;height:12px;cursor:pointer;text-decoration:underline;font-size:11px;' ></div>";			
			var sv = new google.maps.StreetViewService();
			var streetViewLocation = new google.maps.LatLng(pointWGS.y,pointWGS.x);
			sv.getPanoramaByLocation(streetViewLocation, 50, function(data, status) {
				if (status == 'OK') {
					var pos = data.location.latLng;
					document.getElementById("streetviewlink").onclick = function (){ showGoogleSV(1, pointWGS.y, pointWGS.x, pos.lat(), pos.lng());};
					document.getElementById('streetviewlink').innerHTML = 'street view';						
				}
			});
			
			var eCultureMapDiv = "<img style='position:absolute;left:10px;top:0px;height:14px;' src='img/e-culture-map.jpg' />";	
			var html = eCultureMapDiv + streetviewDiv +"<iframe id='gridview' name='gridview' scrolling='no' frameBorder='0' width='" + popupWidth + "' height='" + popupHeight + "' src='gallery/Default.aspx?" + QueryString +"'></iframe>";
			
			popup = new OpenLayers.Popup.FramedCloud("popup",
					e.features[0].geometry.getBounds().getCenterLonLat(),
					null,
					html,
					null, true, null);
			
			OpenLayers.Popup.FramedCloud.prototype.minSize = new OpenLayers.Size(100, 100);
			OpenLayers.Popup.FramedCloud.prototype.maxSize = new OpenLayers.Size(400, 480);
			map.addPopup(popup);
			
			popup.setSize(new OpenLayers.Size(popupWidth, 5+popupHeight));
			/*
			if (mobileDevice == true) {} else {
				document.getElementById('popup_contentDiv').style.height = (popupHeight + 10) + 'px';
				popup.updateSize();
			}
			*/
			
		});
		
		//userAreaSelect event for feature is unselected
		userAreaSelect.events.register("featureunselected", this, function (e) {
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
				popup.destroy();
			}
		});
		
		map.addControl(userAreaSelect);
		//userAreaSelect.activate();
		
	};
	
	// identify search results
	function identifyPointsSearchResults() {
	
		var translateEN = "@@@@@@@@";
		var translateSI = "@@@@@@@@";
		var translateSV = "@@@@@@@@";
		var translateLT = "@@@@@@@@";
		var translateDK = "@@@@@@@@";
		
		if (splitTranslateResult.length >1) {
			translateEN = "*"+splitTranslateResult[0]+"*";
			translateSI = "*"+splitTranslateResult[1]+"*";
			translateSV = "*"+splitTranslateResult[2]+"*";
			translateLT = "*"+splitTranslateResult[3]+"*";
			translateDK = "*"+splitTranslateResult[4]+"*";
		} else {
			translateEN = "*"+splitTranslateResult[0]+"*";
		}
		
		
		splitTranslateResult = searchString.split("@");
				
		var filter_list = [];
		for (var i in splitTranslateResult) {
			filter_list.push("translate"+i+":" + splitTranslateResult[i].toLowerCase());
		}
		var viewparams = filter_list.join(';');		
		
		singleSelectSearchResults = new OpenLayers.Control.GetFeature({
				protocol : new OpenLayers.Protocol.WFS({
					version : "1.1.0",
					url : geoserverLocation + "/PostGIS/wfs" + "?viewparams="+viewparams,
					featureNS : featureNS,
					geometryName : "geom",
					maxFeatures : 2000,
					featureType : geoserverAllLayer,
					srsName : 'EPSG:900913'
				}),
				clickTolerance : 10,
				single : false,
				clickout : true		
			});
		singleSelectSearchResults.id = "singleSelectSearchResults";

		//singleSelect event for feature selected
		singleSelectSearchResults.events.register("featuresselected", this, function (e) {
			var clickbbox;
			if (e.object.handlers.click.first == null) {
				var xy = map.getPixelFromLonLat(new OpenLayers.LonLat(e.feature.geometry.x, e.feature.geometry.y));
				clickbbox = singleSelectSearchResults.pixelToBounds(xy);
			} else {
				clickbbox = singleSelectSearchResults.pixelToBounds(e.object.handlers.click.first.xy);
			}
			
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
			}
			QueryString = "";
			
			var searchByParameterE = document.getElementById("searchByParameter");
			var searchByParameter = searchByParameterE.options[searchByParameterE.selectedIndex].value;
			/*					
			var IDCArray = new Array();
			var validFeatures = 0;
			
			for (var i = 0; i < e.features.length; i++) {
				IDCArray[i] = e.features[i].attributes.IDC;
			}
			
			if (IDCArray.length > 100) {
				IDCArray.length = 100;
			}
			
			var IDCstring = IDCArray[0];
			for (var i = 1; i < IDCArray.length; i++) {
				if (IDCArray[i - 1] != IDCArray[i]) {
					IDCstring += "." + IDCArray[i]
				}
			}
			*/
			var jsonFile = new XMLHttpRequest();
			
			if (selectedLayerName() == "All") {
				QueryString = "bbox=" + clickbbox + "&searchString=" + searchString;
				if (searchByParameter == "allfields") {					
					jsonFile.open("GET", ""+JSONserviceURL+"?bbox=" + clickbbox + "&searchString=" + encodeURIComponent(searchString) + "&fts=allfields", false);
				} else {
					jsonFile.open("GET", ""+JSONserviceURL+"?bbox=" + clickbbox + "&searchString=" + encodeURIComponent(searchString), false);
				}

			} else {
				QueryString = "bbox=" + clickbbox + "&searchString=" + searchString + "&PROJECT=" + selectedLayerName();
				if (searchByParameter == "allfields") {					
					jsonFile.open("GET", ""+JSONserviceURL+"?bbox=" + clickbbox + "&searchString=" + encodeURIComponent(searchString) + "&PROJECT=" + selectedLayerName() + "&fts=allfields", false);
				} else {
					jsonFile.open("GET", ""+JSONserviceURL+"?bbox=" + clickbbox + "&searchString=" + encodeURIComponent(searchString) + "&PROJECT=" + selectedLayerName(), false);
				}	
			}
			
			jsonFile.send();
			var jsondata = jsonFile.responseText;
			var obj = jQuery.parseJSON(jsondata);
				if (jsondata == "{\"IDCArray\":[]}") {
					return;
				}
				validFeatures = obj.IDCArray[0].IDCcount;
			
			if (validFeatures == 0) {
				return;
			}
			var popupHeight = 143;
			var popupWidth = 350;
			if (validFeatures > 6) {
				popupHeight = 380;
			} else if (validFeatures > 3) {
				popupHeight = 260;
			} else if (validFeatures < 2) {
				popupHeight = 143;
				popupWidth = 110;
			} else if (validFeatures < 3) {
				popupHeight = 143;
				popupWidth = 220;
			}
			
			var fts = "";
			if (searchByParameter == "allfields") {	fts="allfields";}
			
			var pointWGS, pointSpherical;
			if (e.object.handlers.click.first == null) {
				pointWGS = new OpenLayers.Geometry.Point(clickbbox.getCenterLonLat().lon, clickbbox.getCenterLonLat().lat);
				pointWGS = pointWGS.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
				pointSpherical = e.feature.geometry.getBounds().getCenterLonLat();
			} else {
				pointWGS = e.features[0].geometry.clone();
				pointWGS = pointWGS.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
				pointSpherical = e.features[0].geometry.getBounds().getCenterLonLat();
			}
			var streetviewDiv = "<div id='streetviewlink' style='position:absolute;left:40px;bottom:3px;height:12px;cursor:pointer;text-decoration:underline;font-size:11px;' ></div>";			
			var sv = new google.maps.StreetViewService();
			var streetViewLocation = new google.maps.LatLng(pointWGS.y,pointWGS.x);
			sv.getPanoramaByLocation(streetViewLocation, 50, function(data, status) {
				if (status == 'OK') {
					var pos = data.location.latLng;
					document.getElementById("streetviewlink").onclick = function (){ 
						showGoogleSV(1, pointWGS.y, pointWGS.x, pos.lat(), pos.lng());
												
						permalinkState[0] = pointWGS.x;
						permalinkState[1] = pointWGS.y;
						permalinkState[7] = 'YES';
						
						closePopup();
					};
					document.getElementById('streetviewlink').innerHTML = 'street view';	
					
				}
			});
			var eCultureMapDiv = "<img style='position:absolute;left:10px;top:0px;height:14px;' src='img/e-culture-map.jpg' />";	
			var html = eCultureMapDiv + streetviewDiv +"<iframe id='gridview' name='gridview' scrolling='no' frameBorder='0' width='" + popupWidth + "' height='" + popupHeight + "' src='gallery/Default.aspx?IDC=0&" + QueryString + "&fts=" + fts + "'></iframe>";
			
			popup = new OpenLayers.Popup.FramedCloud("popup",
					pointSpherical,
					null,
					html,
					null, true, closePopup);

			
			OpenLayers.Popup.FramedCloud.prototype.minSize = new OpenLayers.Size(100, 100);
			OpenLayers.Popup.FramedCloud.prototype.maxSize = new OpenLayers.Size(400, 480);
			map.addPopup(popup);
			
			popup.setSize(new OpenLayers.Size(popupWidth, 5+popupHeight));
			
			/*
			if (mobileDevice == true) {} else {
				document.getElementById('popup_contentDiv').style.height = (popupHeight + 10) + 'px';
				popup.updateSize();
			}
			*/
			permalinkState[0] = pointWGS.x;
			permalinkState[1] = pointWGS.y;
			permalinkState[5] = 'YES';
			permalinkState[6] = clickbbox;
			
		});
		
		//singleSelect event for feature is unselected
		singleSelectSearchResults.events.register("featureunselected", this, function (e) {
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
				popup.destroy();
			}
		});
		
		map.addControl(singleSelectSearchResults);
		singleSelectSearchResults.activate();
		
	};

	function customLayerSwitcher() {
		if (document.getElementById('layerSwitcherCont').style.visibility != "visible") {
			closeAllOpenItems();
			document.getElementById('layerSwitcherCont').style.visibility = "visible";
			document.getElementById('layerSwitcherButton').style.backgroundImage = "url('img/layer-switcher-maximize.png')";
		} else {
			document.getElementById('layerSwitcherCont').style.visibility = "hidden";
			document.getElementById('layerSwitcherButton').style.backgroundImage = "url('img/layer-switcher-minimize.png')";
		}
	};

	// add search results to the map
	function addSearchResults(parameterTITLE,zoom) {
		allVisOff('search layer');
		
		searchString = parameterTITLE;
		
		if (searchString.length > 0) {
			document.getElementById('searchText1').value = searchString;
			if (document.getElementById("searchingResult").style.display == 'block') {
				document.getElementById("searchingResult").style.display = 'none';
			}
			var searchByParameterE = document.getElementById("searchByParameter");
			var searchByParameter = searchByParameterE.options[searchByParameterE.selectedIndex].value;
			
			toggleSearchingDiv('searchingDiv');
			
			if (layerSearchResult) {
				layerSearchResult.destroy();
			}
			if (document.getElementById("multilingual").checked == true) {
				var translateSearchString = new XMLHttpRequest();
				translateSearchString.open("GET", ""+translateURL+"?query=" + searchString +"", false);
				translateSearchString.send();
				searchString = translateSearchString.responseText;
			}
			// get extent and total number of results
			var jsonFile = new XMLHttpRequest();
			if (selectedLayerName() == "All") {
				if (searchByParameter == "allfields") {
					jsonFile.open("GET", ""+JSONserviceURL+"?searchString=" + encodeURIComponent(searchString) + "&PROJECT=&fts=allfields", true);
				} else {
					jsonFile.open("GET", ""+JSONserviceURL+"?searchString=" + encodeURIComponent(searchString) + "&PROJECT=", true);
				}				
			} else {
				if (searchByParameter == "allfields") {
					jsonFile.open("GET", ""+JSONserviceURL+"?searchString=" + encodeURIComponent(searchString) + "&PROJECT=" +selectedLayerName() + "&fts=allfields", true);
				} else {
					jsonFile.open("GET", ""+JSONserviceURL+"?searchString=" + encodeURIComponent(searchString) + "&PROJECT=" +selectedLayerName(), true);
				}	
			}
			permalinkState[3] = encodeURIComponent(searchString);
			jsonFile.send();
			jsonFile.onreadystatechange = function () {
				if (jsonFile.readyState == 4 && jsonFile.status == 200) {
					var jsondata = jsonFile.responseText;
					
					var obj = jQuery.parseJSON(jsondata);
						
						if (obj.IDCArray.length == 0) {
							document.getElementById("searchingResult").innerHTML = '<p>No results found!</p>';
							if (GetQueryString("TITLE") != "" && document.getElementById('searchText1').value == "") { 
								restoreOriginalConfig();
							}
							toggleSearchingDiv('searchingResult');
							toggleSearchingDiv('searchingDiv');
							return;
						} else {
							if (layerCarareCached.visibility == true) {
								layerCarareCached.setVisibility(false);
							}
						}
					//cql_filter = "";
					var bbox = null;
					var point;
					var totalHits = 0;
					
					var clusterFeatures = [];
					for (var i in obj.IDCArray) {
						totalHits = totalHits + obj.IDCArray[i].Hits;
						
						point = new OpenLayers.Geometry.Point(obj.IDCArray[i].Lon, obj.IDCArray[i].Lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));						
						var geometry = point;
							if (bbox == null) {
								bbox = geometry.getBounds();
							} else {
								bbox.extend(geometry.getBounds());
							}
											
						//var coordinates = selectedCentroids[i].split(",");
						var point = new OpenLayers.Geometry.Point( obj.IDCArray[i].Lon, obj.IDCArray[i].Lat);
						point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

						var pointFeature = new OpenLayers.Feature.Vector(point, {'count': obj.IDCArray[i].Hits}, null);
						clusterFeatures.push(pointFeature);
					}
					layerSearchCluster.removeAllFeatures();
					layerSearchCluster.addFeatures(clusterFeatures);
					layerSearchCluster.setVisibility(true);
					//layerSearchCluster.refresh({force: true});
					
					document.getElementById("searchingResult").innerHTML = '<p>Found: ' + totalHits + '</p>';
					toggleSearchingDiv('searchingResult');
					
					// zoom to single or multiple features
					if (zoom == true) {
						if (obj.IDCArray.length == 1) {
							map.setCenter(new OpenLayers.LonLat(point.x, point.y), 13);
						} else {
							try {map.zoomToExtent(bbox);} catch(err) {}
						}
					}
					splitTranslateResult = searchString.split("@");
					
					var filter_list = [];
					for (var i in splitTranslateResult) {
						filter_list.push("translate"+i+":" + splitTranslateResult[i].toLowerCase());
					}
					
					if (selectedLayerName() != "All") {
						if (searchByParameter == "allfields") {
							filter_list.push("project: AND a.\"PROJECT\" ='" + selectedLayerName() + "'");
						} else {
							filter_list.push("project: AND \"PROJECT\" ='" + selectedLayerName() + "'");
						}		
					}
		

					var viewparams = filter_list.join(';');
					
					
					var fts = "fts1";
					if (searchByParameter == "allfields") {
						fts = "fts2";
					}
					
					layerSearchResult = new OpenLayers.Layer.WMS("CarareResults",
							geoserverLocation+"/PostGIS/wms", {
							layers : "PostGIS:"+geoserverAllLayer+"_" + fts,
							transparent : "true",
							maxFeatures : 50000,
							format : "image/png"
						}, {
							isBaseLayer : false,
							singleTile : true,
							ratio : 1,
							minScale : 216000,
							tileOptions : {
								maxGetUrlLength : 2048
							},
							displayInLayerSwitcher : false
						});
						
					singleSelect.deactivate();

					layerSearchResult.mergeNewParams({viewparams: viewparams});
					
					if (singleSelectSearchResults == null) {						
						identifyPointsSearchResults();
					} else {					
						singleSelectSearchResults.activate();
					}
					map.addLayer(layerSearchResult);
					toggleSearchingDiv('searchingDiv');
					map.events.triggerEvent("moveend");
				}
			}
		} else {
			alert("Please enter at least 1 letter");
		}
	}
	// zoom to full extent and display all features
	function restoreOriginalConfig() {

		var bbox = new OpenLayers.Bounds(-4500000, 3050000, 7500000, 9800000);

		
		
		try {
			map.zoomToExtent(bbox);
			document.getElementById('searchText1').value = "";
			document.getElementById("searchingResult").style.display = 'none';
			searchString = "";

			
			selectedLayer().visibility = true;
			selectedLayer().redraw();
			clearSearchResults();
			singleSelect.activate();
			userAreaSelect.deactivate();

		} catch(err) {}
		map.events.triggerEvent("moveend");	
	}
	
	function clearSearchResults() {
		if (layerSearchResult != null) {
			map.removeLayer(layerSearchResult);
			singleSelectSearchResults.deactivate();
			layerSearchResult = null;
			layerSearchCluster.setVisibility(false);
			layerSearchCluster.destroyFeatures();
			permalinkState[3] = null;
		}
	}
	// executes search with enter key
	function handleKeyPress(e, form) {
		var key = e.keyCode || e.which;
		if (key == 13) {
			addSearchResults(document.getElementById('searchText1').value.toLowerCase(),true);
		}
	}
	function toggleSearchingDiv(divid) {
		
		if (document.getElementById(divid).style.display == 'none') {
			//closeAllOpenItems();
			document.getElementById(divid).style.display = 'block';
		} else {
			document.getElementById(divid).style.display = 'none';
		}
	}
	
	function toggleUserAreaWindow1() {
	
		if (document.getElementById("userAreaButton1").src.indexOf("gumbUserArea.png") > -1) {
			//vedno pokaže collection page na začetku
			document.getElementById("UserAreaGridView").src = "UserArea/Collection.aspx";
			document.getElementById("userAreaButton1").src = 'img/gumbeCultureMap.png';
			document.getElementById("TopBarRightDiv").style.right = "-96px";
			document.getElementById("UserArea").style.display = 'block';	
		} else {
			// hide userarea
			document.getElementById("UserAreaGridView").src = "UserArea/Collection.aspx";
			document.getElementById("UserAreaCheckbox").checked = false;
			document.getElementById("userAreaTopBar").style.display = 'none';
			document.getElementById("AllCheckbox").checked = true;
			closeUserAreaItemPreviewDiv();
			if (geocodeMarkers != null) {
				geocodeMarkers.clearMarkers();
			}
			changeLayersVis('AllCheckbox');
			restoreOriginalConfig();
			document.getElementById("UserArea").style.display = 'none';
			document.getElementById("userAreaButton1").src = 'img/gumbUserArea.png';
			document.getElementById("userAreaButton2").src = 'img/gumbUserMap.png';
			document.getElementById("TopBarRightDiv").style.right = "-96px";
			document.getElementById("captureButtons").style.display = 'none';
		}
	
	}
	
	function toggleUserAreaWindow2() {
	
		if (document.getElementById("UserArea").style.display == 'none') {
			document.getElementById("UserArea").style.display = 'block';
			document.getElementById("userAreaButton2").src = 'img/gumbUserMap.png';
			//vedno pokaže collection page na začetku
			//document.getElementById("UserAreaGridView").src = document.getElementById("UserAreaGridView").src;
		} else {
			document.getElementById("UserArea").style.display = 'none';
			document.getElementById("userAreaButton2").src = 'img/gumbUserTable.png';
		}
	
	}
	
	function toggleSearch(divid) {
		
		if (document.getElementById(divid).style.display == 'none') {
			closeAllOpenItems();
			document.getElementById(divid).style.display = 'block';
			document.getElementById("filterButton").style.backgroundImage = 'url(img/filterActive.png)';
			
		} else {
			document.getElementById(divid).style.display = 'none';
			document.getElementById("filterButton").style.backgroundImage = 'url(img/filterInactive.png)';
		}
	}
	function toggleLegend(divid) {
		
		if (document.getElementById(divid).style.display == 'none') {
			closeAllOpenItems();
			document.getElementById(divid).style.display = 'block';
			document.getElementById("legendButton").style.backgroundImage = 'url(img/LegendActive.png)';
		} else {
			document.getElementById(divid).style.display = 'none';
			document.getElementById("legendButton").style.backgroundImage = 'url(img/LegendInactive.png)';
		}
	}

	function toggleFindLocation() {
		
		if (document.getElementById('findLocation').style.display == 'none') {
			closeAllOpenItems();
			document.getElementById('findLocation').style.display = 'block';
			document.getElementById('findLocationButton').style.backgroundImage = 'url(img/findLocationActive.png)';
		} else {
			document.getElementById('findLocation').style.display = 'none';
			document.getElementById('findLocationButton').style.backgroundImage = 'url(img/findLocationInactive.png)';
		}
	}	
	function toggledrawLine() {
		
		if (drawLineControl.active == true) {
			document.getElementById("drawLineButton").style.backgroundImage = 'url(\"img/drawLineInactive.png\")';
			drawLineControl.deactivate();
			if (layerSearchResult != null) {singleSelectSearchResults.activate();} else {singleSelect.activate();}			
			
		} else {
			document.getElementById("drawLineButton").style.backgroundImage = 'url(\"img/drawLineActive.png\")';			
			if (layerSearchResult != null) {singleSelectSearchResults.deactivate();}	
			singleSelect.deactivate();
			
			drawLineControl.activate();
			
		}
	}
	function toggleUpdateUserAreaLocation() {
		if (addPointControl.active == true) {
			document.getElementById("updateLocationButton").style.backgroundImage = 'url(\"img/updateInactive.png\")';
			addPointControl.deactivate();
			if (layerSearchResult != null) {singleSelectSearchResults.activate();} else {singleSelect.activate();}			
			
		} else {
			document.getElementById("updateLocationButton").style.backgroundImage = 'url(\"img/updateActive.png\")';			
			if (layerSearchResult != null) {singleSelectSearchResults.deactivate();}	
			singleSelect.deactivate();	
			addPointControl.activate();
			
		}		
	}
	
	function toggleShareSelect(selectType) {
		//if userarea is visible, switch to all
		if (layerUserArea.visibility == true) {
			document.getElementById("AllCheckbox").checked = true;
			changeLayersVis('AllCheckbox');
		}
		//clear stuff on the map
		lineLayer.destroyFeatures();
		closePopup();
		
		if (selectType == 'point') {
			toggleShareSelectPoint();
		} else if (selectType == 'circle') {
			toggleShareSelectCircle();
		} else if (selectType == 'path') {
			toggleShareSelectPath();
		} else if (selectType == 'frame') {
			toggleShareSelectFrame();
		}
		
	}
	function activateIdentify() {
		if (document.getElementById("UserAreaCheckbox").checked == true) {
			singleSelect.deactivate();
			userAreaSelect.activate();
		} else {
			userAreaSelect.deactivate();
			singleSelect.activate();
		}	
	}
	function toggleShareSelectPoint() {	
		if (shareSelectControlPoint.active == true) {
			shareSelectControlPoint.deactivate();
			document.getElementById("individualButton").style.backgroundImage = 'url(\"img/individualInactive.png\")';
			var controls = map.getControlsBy("active", true);			
			activateIdentify();
			controls = map.getControlsBy("active", true);
			map.events.triggerEvent("moveend");
		} else {
			SelectDrawControlDeactivation();
			shareSelectControlPoint.activate();
			document.getElementById("individualButton").style.backgroundImage = 'url(\"img/individualActive.png\")';	
		}	
	}
	function toggleShareSelectCircle() {		
		if (shareSelectControlCircle.active == true) {
			shareSelectControlCircle.deactivate();
			document.getElementById("circleButton").style.backgroundImage = 'url(\"img/circleInactive.png\")';
			activateIdentify();
			map.events.triggerEvent("moveend");			
		} else {
			SelectDrawControlDeactivation();
			shareSelectControlCircle.activate();
			document.getElementById("circleButton").style.backgroundImage = 'url(\"img/circleActive.png\")';	
		}	
	}
	function toggleShareSelectPath() {		
		if (shareSelectControlPath.active == true) {
			shareSelectControlPath.deactivate();
			document.getElementById("pathButton").style.backgroundImage = 'url(\"img/pathInactive.png\")';
			activateIdentify();
			map.events.triggerEvent("moveend");			
		} else {
			SelectDrawControlDeactivation();
			shareSelectControlPath.activate();
			document.getElementById("pathButton").style.backgroundImage = 'url(\"img/pathActive.png\")';	
		}	
	}
	function toggleShareSelectFrame() {		
		if (shareSelectControlFrame.active == true) {
			shareSelectControlFrame.deactivate();
			document.getElementById("frameButton").style.backgroundImage = 'url(\"img/frameInactive.png\")';			
			activateIdentify();
			map.events.triggerEvent("moveend");
		} else {
			SelectDrawControlDeactivation();
			shareSelectControlFrame.activate();
			document.getElementById("frameButton").style.backgroundImage = 'url(\"img/frameActive.png\")';	
		}	
	}
	
	function addToShare(type) {
		var jsonFile = new XMLHttpRequest();
		jsonFile.open("GET", "UserArea/Capture.aspx?mode=add&type=" + type, false);
		jsonFile.send();			
		alert("Selection added to share.");		
		layerUserArea.redraw(true);			
		closePopup();
		lineLayer.destroyFeatures();
		activateIdentify();
		
		//deactivate capture control
		if (type == 'point') {
			shareSelectControlPoint.deactivate();
			document.getElementById("individualButton").style.backgroundImage = 'url(\"img/individualInactive.png\")';
		}
		if (type == 'circle') {
			shareSelectControlCircle.deactivate();
			document.getElementById("circleButton").style.backgroundImage = 'url(\"img/circleInactive.png\")';
		}
		if (type == 'path') {
			shareSelectControlPath.deactivate();
			document.getElementById("pathButton").style.backgroundImage = 'url(\"img/pathInactive.png\")';
		}
		if (type == 'frame') {
			shareSelectControlFrame.deactivate();
			document.getElementById("frameButton").style.backgroundImage = 'url(\"img/frameInactive.png\")';
		}
	}
	
	// google streetview
	function toggleGoogleSVPegman() {
		if (googleSVpoint.active == true) {
			document.getElementById("google-SVButton").style.backgroundImage = 'url(\"img/pegmanInactive.png\")';
			googleSVpoint.deactivate();
			if (layerSearchResult != null) {singleSelectSearchResults.activate();} else {singleSelect.activate();}			
			
		} else {
			document.getElementById("google-SVButton").style.backgroundImage = 'url(\"img/pegmanActive.png\")';			
			if (layerSearchResult != null) {singleSelectSearchResults.deactivate();}	
			singleSelect.deactivate();	
			googleSVpoint.activate();
			
		}
		
	}
	
	function showGoogleMap(status) {
		if (status == 1) {
			closeAllOpenItems();
			document.getElementById("googlemapiframe").src = "google-map.html?zoom=" + lastZoom + "&lat=" + lastCoordinates.lat + "&lon=" + lastCoordinates.lon;
			document.getElementById("google-map").style.display = "block";
		} else {
			document.getElementById("googlemapiframe").src = "about:blank";
			document.getElementById("google-map").style.display = "none";		
			permalinkState[7] = null;
		}
	}	
	
	function showGoogleSV(status, svlat, svlon, panolat, panolon) {
		if (status == 1) {
			closeAllOpenItems();
			document.getElementById("googlemapiframe").src = "google-sv.html?zoom=" + lastZoom + "&lat=" + lastCoordinates.lat + "&lon=" + lastCoordinates.lon + "&svlat=" + svlat + "&svlon=" + svlon + "&panolat=" + panolat + "&panolon=" + panolon ;
			document.getElementById("google-map").style.display = "block";
			permalinkState[0] = svlon;
			permalinkState[1] = svlat;
			permalinkState[7] = 'YES';
			
		} else {
			document.getElementById("googlemapiframe").src = "about:blank";
			document.getElementById("google-map").style.display = "none";		
			permalinkState[7] = null;
		}
	}
	
	function closeUserAreaItemPreviewDiv() {		
		document.getElementById("userAreaItemPreview").style.display = "none";
	}


	function allVisOff(layer) {
		
		clearSearchResults();
		
		var allMapLayers = map.layers;
		for(var i = 0; i < allMapLayers.length; i++ ){
			if (  allMapLayers[i].name.indexOf("Cluster") < 0 && allMapLayers[i].name.indexOf("Google") < 0 && allMapLayers[i].name.indexOf("Street") < 0 && allMapLayers[i].name.indexOf("Line") < 0 && allMapLayers[i].name.indexOf("Markers") < 0 ) {
				allMapLayers[i].setVisibility(false);
			}			
		};
		
		if (layer.indexOf("UserAreaCheckbox") > -1) {
			singleSelect.deactivate();
			userAreaSelect.activate();
		} else {
			userAreaSelect.deactivate();
			singleSelect.activate();
		}		
	}
	

	
	function changeLayersVis(layer) {
		if (layer == "AllCheckbox") {
				allVisOff(layer);
				layerAllCached.setVisibility(true);
				
				permalinkState[4] = 0;			
		} else if (layer == "CarareCheckbox") {
				allVisOff(layer);
				layerCarareCached.setVisibility(true);
				permalinkState[4] = 1;
		} else if (layer == "LinkedHeritageCheckbox") {		
				allVisOff(layer);
				layerLinkedHeritageCached.setVisibility(true);
				permalinkState[4] = 2;
		} else if (layer == "PartagePlusCheckbox") {		
				allVisOff(layer);
				layerPartagePlusCached.setVisibility(true);
				permalinkState[4] = 3;
		} else if (layer == "AthenaPlusCheckbox") {		
				allVisOff(layer);		
				layerAthenaPlusCached.setVisibility(true);
				permalinkState[4] = 5;
		} else if (layer == "UserAreaCheckbox") {		
				allVisOff(layer);
				layerUserArea.setVisibility(true);
				permalinkState[4] = 6;
		} else if (layer == "A3DIconsCheckbox") {		
				allVisOff(layer);
				layer3DIconsCached.setVisibility(true);
				permalinkState[4] = 4;
		} else if (layer == "PhotographyCheckbox") {		
				allVisOff(layer);
				layerPhotographyCached.setVisibility(true);
				permalinkState[4] = 7;
		}		
		map.events.triggerEvent("moveend");			
		
			
	}
	
	// Set the cookie before exiting 
	function setCookie() {
		var currentBaseMap = map.baseLayer.name;
		cookietext = cookiename+"="+currentBaseMap+"|"+lastUser+"|"+lastCollection;
		if (expiredays) {
		  var exdate=new Date();
		  exdate.setDate(exdate.getDate()+expiredays);
		  cookietext += ";expires="+exdate.toGMTString();
		}
		document.cookie=cookietext;
	}
	
	function closeAllOpenItems() {
			document.getElementById('findLocation').style.display = 'none';
			document.getElementById('findLocationButton').style.backgroundImage = 'url(img/findLocationInactive.png)';
			document.getElementById('legendDiv').style.display = 'none';
			document.getElementById("legendButton").style.backgroundImage = 'url(img/LegendInactive.png)';
			document.getElementById('searchTool').style.display = 'none';
			document.getElementById('filterButton').style.backgroundImage = 'url(img/filterInactive.png)';
			document.getElementById('layerSwitcherCont').style.visibility = "hidden";
			document.getElementById('layerSwitcherButton').style.backgroundImage = "url('img/layer-switcher-minimize.png')";
	}
	function closePopup() {
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
				popup.destroy();
			}
			
			permalinkState[5] = null;
			permalinkState[6] = null;
			
	}
	
	function updateUserAreaLocation(remarks,accuracy,type,updateall,placenamenew) {
		lastType = type;
		var jsonFile = new XMLHttpRequest();
		if (updateall == "on") {
			jsonFile.open("GET", "UserArea/UpdateLocation.aspx?gid=" + encodeURIComponent(lastgid) + "&user=" + encodeURIComponent(lastUser) + "&collection=" + encodeURIComponent(lastCollection) + "&placename=" + encodeURIComponent(lastPlaceName) + "&lon=" + updateUserAreaPoint.x + "&lat=" + updateUserAreaPoint.y + "&remarks=" + encodeURIComponent(remarks) + "&acc=" + accuracy + "&type=" + type + "&placenamenew=" + encodeURIComponent(placenamenew) + "&all=1", true);
		} else {
			jsonFile.open("GET", "UserArea/UpdateLocation.aspx?gid=" + encodeURIComponent(lastgid) + "&user=" + encodeURIComponent(lastUser) + "&collection=" + encodeURIComponent(lastCollection) + "&placename=" + encodeURIComponent(lastPlaceName) + "&lon=" + updateUserAreaPoint.x + "&lat=" + updateUserAreaPoint.y + "&remarks=" + encodeURIComponent(remarks) + "&acc=" + accuracy + "&type=" + type + "&placenamenew=" + encodeURIComponent(placenamenew) + "&all=0", true);
		}
		jsonFile.send();
		jsonFile.onreadystatechange = function () {
			if (jsonFile.readyState == 4 && jsonFile.status == 200) {
				while (map.popups.length) {
					map.removePopup(map.popups[0]);
				}
				layerUserArea.redraw(true);
				if (jsonFile.responseText != 'Update successful') {
					alert("Something went wrong. Update failed.");
				}
			}
		}
		geocodeMarkers1.removeAllFeatures();
		var tocka = updateUserAreaPoint;
		toggleUpdateUserAreaLocation();
		document.getElementById("updateLocationButton").style.display = 'none';
	}
	
	function setPermalink() {
			var permalink = window.location.href.split('?')[0];
				if (permalinkState[5] == 'YES') { //if thumbnail yes
					permalink += '?LON=' + permalinkState[0];
					permalink += '&LAT=' + permalinkState[1];
					permalink += '&ZOOM=' + permalinkState[2];
					permalink += '&LAYER=' + permalinkState[4];
					permalink += '&THUMB=' + permalinkState[5];
					permalink += '&CLICKBBOX=' + permalinkState[6];
					if (permalinkState[3] != null) {
						permalink += '&TITLE=' + permalinkState[3];
					}				
				} else if (permalinkState[7] == 'YES') { // if streetview
					permalink += '?LON=' + permalinkState[0];
					permalink += '&LAT=' + permalinkState[1];
					permalink += '&ZOOM=' + permalinkState[2];
					permalink += '&LAYER=' + permalinkState[4];
					permalink += '&SVIEW=' + permalinkState[7];
				} else {
					permalink += '?LON=' + permalinkState[0];
					permalink += '&LAT=' + permalinkState[1];
					permalink += '&ZOOM=' + permalinkState[2];
					permalink += '&LAYER=' + permalinkState[4];
					if (permalinkState[3] != null) {
						permalink += '&TITLE=' + permalinkState[3];
					}
				}
			window.location.href = permalink;	
	}

		function setLayerOpacity() {		
				if (layerAllCached.visibility == true) {
					if (map.zoom > 13) {
						layerAllCached.setOpacity(1);
					} else {
						layerAllCached.setOpacity(0.7);
					}
				}
				if (layerCarareCached.visibility == true) {
					if (map.zoom > 13) {
						layerCarareCached.setOpacity(1);
					} else {
						layerCarareCached.setOpacity(0.7);
					}
				}
				if (layerLinkedHeritageCached.visibility == true) {
					if (map.zoom > 13) {
						layerLinkedHeritageCached.setOpacity(1);
					} else {
						layerLinkedHeritageCached.setOpacity(0.7);
					}
				}
				if (layerPartagePlusCached.visibility == true) {
					if (map.zoom > 13) {
						layerPartagePlusCached.setOpacity(1);
					} else {
						layerPartagePlusCached.setOpacity(0.7);
					}
				}	
				if (layerAthenaPlusCached.visibility == true) {
					if (map.zoom > 13) {
						layerAthenaPlusCached.setOpacity(1);
					} else {
						layerAthenaPlusCached.setOpacity(0.7);
					}
				}
				if (layerPhotographyCached.visibility == true) {
					if (map.zoom > 13) {
						layerPhotographyCached.setOpacity(1);
					} else {
						layerPhotographyCached.setOpacity(0.7);
					}
				}
				if (layer3DIconsCached.visibility == true) {
					if (map.zoom > 13) {
						layer3DIconsCached.setOpacity(1);
					} else {
						layer3DIconsCached.setOpacity(0.7);
					}
				}
				if (layerUserArea.visibility == true) {
					if (map.zoom > 13) {
						layerUserArea.setOpacity(1);
					} else {
						layerUserArea.setOpacity(0.7);
					}
				}
				if (layerSearchResult != null) {
					if (layerSearchResult.visibility == true) {
						if (map.zoom > 13) {
							layerSearchResult.setOpacity(1);
						} else {
							layerSearchResult.setOpacity(1);
						}
					}
				}				
		}
	
	function createShareCaptureControls() {
		
				var drawOptions =	{
					'handlerOptions': {
						'style': {
							'strokeColor': '#FFFF00',
							'strokeOpacity': 1,
							'strokeWidth': 3,
							'fillColor': '#FFFF00',
							'fillOpacity': 0,
							'pointRadius': 6
						},
						'snapAngle' : 0,
						'irregular' : true,
						'sides' : 4
					}
				};
				
//point
				shareSelectControlPoint = new OpenLayers.Control.DrawFeature(lineLayer,OpenLayers.Handler.Point, drawOptions);
				shareSelectControlPoint.id = "shareSelectControlPoint";
				map.addControl(shareSelectControlPoint);
//point event
				shareSelectControlPoint.events.register("featureadded", this, function (e) {	
				
					var pointStyle =	{
						'strokeColor': '#FFFF00',
						'strokeOpacity': 1,
						'strokeWidth': 3,
						'fillColor': '#FFFF00',
						'fillOpacity': 0.5,
						'pointRadius': 6
					};
					
					var pointGeometry = e.feature.geometry; // xy
					var pointPixel = map.getPixelFromLonLat(new OpenLayers.LonLat(pointGeometry.x, pointGeometry.y));
					var pp1,pp2;
					pp1 = new OpenLayers.Pixel(pointPixel.x-5,pointPixel.y-5);
					pp2 = new OpenLayers.Pixel(pointPixel.x+5,pointPixel.y+5);
					var ppg1, ppg2
					ppg1 = map.getLonLatFromPixel(pp1).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
					ppg2 = map.getLonLatFromPixel(pp2).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			
					var par1 = ppg1.lon +"," + ppg2.lat +"," + ppg2.lon +"," + ppg1.lat;
					
					var selectURL;
					if (selectedLayerName() == "All" || selectedLayerName() == "" ) {
						selectURL = "UserArea/Capture.aspx?mode=select&type=point&par1=" + par1;
					} else {
						selectURL = "UserArea/Capture.aspx?mode=select&type=point&par1=" + par1 + "&project=" + selectedLayerName();
					}
					
					lineLayer.destroyFeatures();
					closePopup();
					
					var selectRequest = new XMLHttpRequest();
					selectRequest.open("GET", selectURL, false);
					selectRequest.send();
					var selectData = selectRequest.responseText;
					//var selectData = "14.215537,45.7764523;14.2121187,45.775376;14.2151695040001,45.775145007;14.2138338300001,45.775027869;14.213641965,45.7758723740001@5@18";
					var obj = selectData.split("@");
					
					
					var centroids = obj[1];
					var objects = obj[2];
					if (objects > 100000) {
						objects = "100000 (truncated)";
					}
					if (centroids > 10000) {
						centroids = "10000 (truncated)";
					}
					//create popup with info if objects selected
					if (objects != "" || objects != 0) {
						var selectedCentroids = obj[0].split(";");
						for(var i = 0; i < selectedCentroids.length; i++ ){
							var coordinates = selectedCentroids[i].split(",");
							var point = new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]);
								point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
								var pointFeature = new OpenLayers.Feature.Vector(point, null, pointStyle);
							lineLayer.addFeatures([pointFeature]);
						};
						
						lineLayer.refresh({force: true});
						
						var html = "<div style='font-size:16px'><b>Selected:</b><br/>Centroids:" + centroids + "<br/>Objects:" + objects + "</div>";
						html += '<br/><br/><input type="button" class="formButton" id="Submit" value="Add to share" Width="100px" onclick="addToShare(\'point\');" />';
						popup = new OpenLayers.Popup.FramedCloud("popup",
								pointGeometry.getBounds().getCenterLonLat(),
								null,
								html,
								null, true, null);
							

						map.addPopup(popup);
						
					}
	
					
				});
				
//circle
				shareSelectControlCircle = new OpenLayers.Control.DrawFeature(lineLayer,OpenLayers.Handler.Point, drawOptions);
				shareSelectControlCircle.id = "shareSelectControlCircle";
				map.addControl(shareSelectControlCircle);
//circle event
				shareSelectControlCircle.events.register("featureadded", this, function (e) {
				
						var pointGeometry = e.feature.geometry;
						var pointWGS = pointGeometry.clone().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
						
						lineLayer.destroyFeatures();
						closePopup();
						
						var html = "<div style='font-size:16px'><b>Specify radius (m):</b><br/>"
						html += '<input type="text" id="radius" value="500" style="width:4em;background-color:#fafafa;border-radius:3px;border:1px solid #a9a9a9;resize:none;"></div>';
						html += '<br/><br/><input type="button" class="formButton" id="Submit" value="Submit" Width="70px" onclick="shareSelection(\''+ pointWGS.x +',' + pointWGS.y + '\',$(\'#radius\').val(),\'circle\');" />';
						popup = new OpenLayers.Popup.FramedCloud("popup",
								pointGeometry.getBounds().getCenterLonLat(),
								null,
								html,
								null, true, null);
							

						map.addPopup(popup);
						//lineLayer.destroyFeatures();
				});
//path
				shareSelectControlPath = new OpenLayers.Control.DrawFeature(lineLayer,OpenLayers.Handler.Path, drawOptions);
				shareSelectControlPath.id = "shareSelectControlPath";
				map.addControl(shareSelectControlPath);
//path event
				shareSelectControlPath.events.register("featureadded", this, function (e) {
						
						var lineGeometry = e.feature.geometry;
						var lineFeature = e.feature.clone();
						var polyline = "";
						for (var i = 0; i < lineGeometry.components.length; i++) {
								var x = lineGeometry.components[i].x.toFixed(1);
								var y = lineGeometry.components[i].y.toFixed(1);
								polyline += x +','+y+'@'
						}

						lineLayer.destroyFeatures();
						
						
						//last point on the path
						var pointGeometry = new OpenLayers.Geometry.Point(lineGeometry.components[lineGeometry.components.length-1].x.toFixed(2), lineGeometry.components[lineGeometry.components.length-1].y.toFixed(2));
						//var pointWGS = pointGeometry.clone().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
						
						//lineLayer.destroyFeatures();
						closePopup();
						
						var html = "<div style='font-size:16px'><b>Specify radius (m):</b><br/>"
						html += '<input type="text" id="radius" value="500" style="width:4em;background-color:#fafafa;border-radius:3px;border:1px solid #a9a9a9;resize:none;"></div>';
						html += '<br/><br/><input type="button" class="formButton" id="Submit" value="Submit" Width="70px" onclick="shareSelection(\''+ polyline + '\',$(\'#radius\').val(),\'path\');" />';
						popup = new OpenLayers.Popup.FramedCloud("popup",
								pointGeometry.getBounds().getCenterLonLat(),
								null,
								html,
								null, true, null);
							

						map.addPopup(popup);
						
						lineLayer.addFeatures([lineFeature]);
						lineLayer.refresh({force: true});
				});
//frame
				shareSelectControlFrame = new OpenLayers.Control.DrawFeature(lineLayer,OpenLayers.Handler.RegularPolygon, drawOptions);
				shareSelectControlFrame.id = "shareSelectControlFrame";
				map.addControl(shareSelectControlFrame);
//frame event
				shareSelectControlFrame.events.register("featureadded", this, function (e) {
					var frameGeomatry = e.feature.geometry;
					
					var pointStyle =	{
						'strokeColor': '#FFFF00',
						'strokeOpacity': 1,
						'strokeWidth': 3,
						'fillColor': '#FFFF00',
						'fillOpacity': 0.5,
						'pointRadius': 6
					};
					var frameWGS = frameGeomatry.clone().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));;
					var frameWGSBounds = frameWGS.getBounds();
			
					var par1 = frameWGSBounds.left +"," + frameWGSBounds.bottom +"," + frameWGSBounds.right +"," + frameWGSBounds.top;
					
					var selectURL;
					if (selectedLayerName() == "All" || selectedLayerName() == "" ) {
						selectURL = "UserArea/Capture.aspx?mode=select&type=frame&par1=" + par1;
					} else {
						selectURL = "UserArea/Capture.aspx?mode=select&type=frame&par1=" + par1 + "&project=" + selectedLayerName();
					}
					
					lineLayer.destroyFeatures();
					closePopup();
					
					var selectRequest = new XMLHttpRequest();
					selectRequest.open("GET", selectURL, false);
					selectRequest.send();
					var selectData = selectRequest.responseText;
					var obj = selectData.split("@");
					
					
					var centroids = obj[1];
					var objects = obj[2];
					if (objects > 100000) {
						objects = "100000 (truncated)";
					}
					if (centroids > 10000) {
						centroids = "10000 (truncated)";
					}
					//create popup with info if objects selected
					if (objects != "" || objects != 0) {
						var selectedCentroids = obj[0].split(";");
						for(var i = 0; i < selectedCentroids.length; i++ ){
							var coordinates = selectedCentroids[i].split(",");
							var point = new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]);
								point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
								var pointFeature = new OpenLayers.Feature.Vector(point, null, pointStyle);
							lineLayer.addFeatures([pointFeature]);
						};
						
						lineLayer.refresh({force: true});
						
						var html = "<div style='font-size:16px'><b>Selected:</b><br/>Centroids:" + centroids + "<br/>Objects:" + objects + "</div>";
						html += '<br/><br/><input type="button" class="formButton" id="Submit" value="Add to share" Width="100px" onclick="addToShare(\'frame\');" />';
						popup = new OpenLayers.Popup.FramedCloud("popup",
								//frameGeomatry.getBounds().getCenterLonLat(),
								new OpenLayers.LonLat(frameGeomatry.getBounds().right, frameGeomatry.getBounds().bottom),
								null,
								html,
								null, true, null);
							

						map.addPopup(popup);
						
					}
					
					
				});
	}
	
	function shareSelection(par1,par2,type) {
		//style for selected points
		var pointStyle =	{
			'strokeColor': '#FFFF00',
			'strokeOpacity': 1,
			'strokeWidth': 3,
			'fillColor': '#FFFF00',
			'fillOpacity': 0.5,
			'pointRadius': 6
		};
//circle					
		if (type == 'circle') {
		
			var selectURL;
			if (selectedLayerName() == "All" || selectedLayerName() == "" ) {
				selectURL = "UserArea/Capture.aspx?mode=select&type=" + type + "&par1=" + par1 + "&par2=" + par2;
			} else {
				selectURL = "UserArea/Capture.aspx?mode=select&type=" + type + "&par1=" + par1 + "&par2=" + par2 + "&project=" + selectedLayerName();
			}
			
			var selectRequest = new XMLHttpRequest();
			selectRequest.open("GET", selectURL, false);
			selectRequest.send();
			var selectData = selectRequest.responseText;
			var obj = selectData.split("@");
			
			
			var centroids = obj[1];
			var objects = obj[2];
			if (objects > 100000) {
				objects = "100000 (truncated)";
			}
			if (centroids > 10000) {
				centroids = "10000 (truncated)";
			}
			

			//create popup with info if objects selected
			if (objects != "" || objects != 0) {
				var selectedCentroids = obj[0].split(";");
				for(var i = 0; i < selectedCentroids.length; i++ ){
					var coordinates = selectedCentroids[i].split(",");
					var point = new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]);
						point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
						var pointFeature = new OpenLayers.Feature.Vector(point, null, pointStyle);
					lineLayer.addFeatures([pointFeature]);
				};
				
				lineLayer.refresh({force: true});
				
				var html = "<div style='font-size:16px'><b>Selected:</b><br/>Centroids:" + centroids + "<br/>Objects:" + objects + "</div>";
				html += '<br/><br/><input type="button" class="formButton" id="Submit" value="Add to share" Width="70px" onclick="addToShare(\'circle\');" />';		
				popup.setContentHTML(html);
				
			} else {
				if (popup.contentHTML.indexOf("No objects") == -1) {
				
					popup.setContentHTML(popup.contentHTML.replace('value="500"','value="' + par2 + '"') + "<br/>No objects within specified radius!");
				}
			}
			
			
			
		}
//path
		if (type == 'path') {
		
			var selectURL;
			if (selectedLayerName() == "All" || selectedLayerName() == "" ) {
				selectURL = "UserArea/Capture.aspx?mode=select&type=" + type + "&par1=" + par1 + "&par2=" + par2;
			} else {
				selectURL = "UserArea/Capture.aspx?mode=select&type=" + type + "&par1=" + par1 + "&par2=" + par2 + "&project=" + selectedLayerName();
			}
			
			var selectRequest = new XMLHttpRequest();
			selectRequest.open("GET", selectURL, false);
			selectRequest.send();
			var selectData = selectRequest.responseText;
			var obj = selectData.split("@");
			
			
			var centroids = obj[1];
			var objects = obj[2];
			if (objects > 100000) {
				objects = "100000 (truncated)";
			}
			if (centroids > 10000) {
				centroids = "10000 (truncated)";
			}
			
			lineLayer.destroyFeatures();
			
			//create popup with info if objects selected
			if (objects != "" || objects != 0) {
				var selectedCentroids = obj[0].split(";");
				for(var i = 0; i < selectedCentroids.length; i++ ){
					var coordinates = selectedCentroids[i].split(",");
					var point = new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]);
						point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
						var pointFeature = new OpenLayers.Feature.Vector(point, null, pointStyle);
					lineLayer.addFeatures([pointFeature]);
				};
				
				lineLayer.refresh({force: true});
				
				var html = "<div style='font-size:16px'><b>Selected:</b><br/>Centroids:" + centroids + "<br/>Objects:" + objects + "</div>";
				html += '<br/><br/><input type="button" class="formButton" id="Submit" value="Add to share" Width="70px" onclick="addToShare(\'path\');" />';		
				popup.setContentHTML(html);
				
			} else {
				if (popup.contentHTML.indexOf("No objects") == -1) {
				
					popup.setContentHTML(popup.contentHTML.replace('value="500"','value="' + par2 + '"') + "<br/>No objects within specified radius!");
				}
			}
			
			
			
		}
	}
	
	function SelectDrawControlDeactivation() {
			//deactivate select/draw controls, 1-2 = nav, mouse etc..
			var controls = map.getControlsBy("active", true);
			for (var i = 3; i < controls.length; i++ ){
				controls[i].deactivate();
			};
			
			document.getElementById("drawLineButton").style.backgroundImage = 'url(\"img/drawLineInactive.png\")';
			document.getElementById("google-SVButton").style.backgroundImage = 'url(\"img/pegmanInactive.png\")';
			
			document.getElementById("individualButton").style.backgroundImage = 'url(\"img/individualInactive.png\")';
			document.getElementById("circleButton").style.backgroundImage = 'url(\"img/circleInactive.png\")';
			document.getElementById("pathButton").style.backgroundImage = 'url(\"img/pathInactive.png\")';
			document.getElementById("frameButton").style.backgroundImage = 'url(\"img/frameInactive.png\")';
			
	}