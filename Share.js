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
			
			//IE9 and lower detection
			var ieLT9 = false;
			if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { 
			   var ieversion=new Number(RegExp.$1);
			   if (ieversion<=8)
			   {
				ieLT9 = true;
			   }		   
			}
			
			var bounds = new OpenLayers.Bounds(-2.003750834E7, -2.003750834E7, 2.0037508345578495E7, 2.0037508345578495E7);
			


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
			
	
		// Google layers

		var gmap = new OpenLayers.Layer.Google(
				"Google Streets", // the default gsat,gmap,ghyb
			{
				numZoomLevels : 19,
				visibility : true
			}, {
				transitionEffect : 'resize'
			});

		
		layerUserArea = new OpenLayers.Layer.WMS("User area",
				geoserverLocation+"/PostGIS/wms", {
				layers : "PostGIS:MC_Cen4_UserArea",
				transparent : "true",
				myData: Math.random(),
				format : 'image/png'
				
			}, {
				visibility : false,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				singleTile: true, 
				ratio: 1,
				//transitionEffect: null,
				opacity: 1
			});
	/*		
		layerUserAreaCluster = new OpenLayers.Layer.WMS("User area",
				geoserverLocation+"/PostGIS/wms", {
				layers : "PostGIS:MC_Cen4_UserArea_cluster",
				transparent : "true",
				myData: Math.random(),
				//STYLES: 'MC_Cen4_UserArea_cluster_simple',
				format : 'image/png'
				
			}, {
				visibility : true,
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				singleTile: true, 
				ratio: 1,
				//transitionEffect: null,
				opacity: 1
			});
	*/
		var styleMap = new OpenLayers.Style();

		var clusterRule1 = new OpenLayers.Rule({
		  filter: new OpenLayers.Filter.Comparison({
			  type: OpenLayers.Filter.Comparison.LESS_THAN,
			  property: "count",
			  value: 2,
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
		
		var bboxPar = GetQueryString("bbox");
		var polyArray = bboxPar.split(",");
		
		var newBounds = new OpenLayers.Bounds();
		newBounds.extend(new OpenLayers.LonLat(polyArray[0],polyArray[1]));
		newBounds.extend(new OpenLayers.LonLat(polyArray[2],polyArray[3]));			
		var cellsize = Math.abs(newBounds.left - newBounds.right)/10;  //cluster grid size	
		
		var viewparams = "user:" + GetQueryString('user').toLowerCase() +";collection:share;selected:TRUE;cellsize:" + cellsize;
		
		layerUserAreaCluster = new OpenLayers.Layer.Vector(
            "share",
            {
                 strategies: [new OpenLayers.Strategy.BBOX()]
                , projection: new OpenLayers.Projection("EPSG:4326")
				, styleMap: styleMap
				, protocol: new OpenLayers.Protocol.HTTP({
					url: "/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PostGIS:MC_Cen4_UserArea_cluster&maxFeatures=800&outputFormat=application/json&viewparams=" + viewparams,
					format: new OpenLayers.Format.GeoJSON()
				}) 
         });
		layerUserAreaCluster.setOpacity(0.1);
		

		layerUserArea.mergeNewParams({'CQL_FILTER': "SELECTED = TRUE AND strToLowerCase(User) = '" + GetQueryString('user').toLowerCase() +"' AND strToLowerCase(Collection) = 'share'"});
		
		//VIEWPARAMS=user%3Akrneki%3Bcollection%3Ashare%3Bselected%3ATRUE%3Bcellsize%3A0.06
		//var currentExtent = map.getExtent().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
		

		//layerUserAreaCluster.mergeNewParams({viewparams: viewparams});
		
		// add layers
		map.addLayers([gmap, layerUserAreaCluster, layerUserArea]);


		
		map.addControl(new OpenLayers.Control.Navigation({
				dragPanOptions : {
					enableKinetic : true,
					kineticInterval : 10
				}
			}));

			

		map.addControl(new OpenLayers.Control.ScaleLine({
				'maxWidth' : 400
			}));
		map.addControl(new OpenLayers.Control.MousePosition({
				displayProjection : new OpenLayers.Projection('EPSG:4326'),
				emptyString : ''
			}));
		map.addControl(new OpenLayers.Control.KeyboardDefaults());
		
		map.events.register("mousemove", map, function (e) {
			var position = this.events.getMousePosition(e);
		});
		

		// make carare layer transparent at larger scales except for ie9 and lower				
		map.events.register('zoomend', null, function (evt) {	
			if (ieLT9 == false) { 
				setLayerOpacity();	
			}					
		});
		
		identifyUserAreaPoints();
				


		
		map.events.register('moveend', null, function (evt) { 
		
			if (map.zoom > 13) {
				layerUserAreaCluster.setVisibility(false);
				layerUserArea.setVisibility(true);
			} else {
				layerUserAreaCluster.setVisibility(true);
				layerUserArea.setVisibility(false);
				
				var currentExtent = map.getExtent().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
				var cellsize = Math.abs(currentExtent.left - currentExtent.right)/10; //cluster grid size
				var viewparams = "user:" + GetQueryString('user').toLowerCase() +";collection:share;selected:TRUE;cellsize:" + cellsize;
				//layerUserAreaCluster.mergeNewParams({viewparams: viewparams});
				layerUserAreaCluster.protocol.options.url = "/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PostGIS:MC_Cen4_UserArea_cluster&maxFeatures=800&outputFormat=application/json&viewparams=" + viewparams;
				layerUserAreaCluster.refresh({force: true});
			}

			lastCoordinates = map.getCenter().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
			lastZoom = map.zoom;
		});

		var bboxPar = GetQueryString("bbox");
		if (bboxPar != "") {
		
			var polyArray = bboxPar.split(",");
			
			var newBounds = new OpenLayers.Bounds();
			newBounds.extend(new OpenLayers.LonLat(polyArray[0],polyArray[1]));
			newBounds.extend(new OpenLayers.LonLat(polyArray[2],polyArray[3]));
			newBounds = newBounds.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));			
			map.zoomToExtent(newBounds);
			//map.zoomOut();
		}
		
		lastCoordinates = map.getCenter().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
		lastZoom = map.zoom;
		
	} // END CarareInit
	

	//var refresh = new OpenLayers.Strategy.Refresh({force: true, active: true});
	
	// click tolerance
	function MapClickTolerance() {
		if (mobileDevice == true) { 
			return 50
		} else {
			return 10
		}
	}
	
	
	// identify
	function identifyUserAreaPoints() {
		
		var filt = new OpenLayers.Filter.Logical({
			type: OpenLayers.Filter.Logical.AND,
			filters: [
				new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.EQUAL_TO,
					matchCase: false,
					property: "User",
					value: GetQueryString('user')
				}),
				new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.EQUAL_TO,
					matchCase: false,
					property: "SELECTED",
					value: true
				}),
				new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.EQUAL_TO,
					matchCase: false,
					property: "Collection",
					value: 'share'
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
					featureType : "MC_Cen4_UserArea",
					srsName : 'EPSG:900913',
					defaultFilter: filt
				}),
				clickTolerance : MapClickTolerance(),
				single : false,
				clickout : true							
			});
		
		//userAreaSelect event for feature selected
		userAreaSelect.events.register("featuresselected", this, function (e) {
		
			var clickbbox = userAreaSelect.pixelToBounds(e.object.handlers.click.first.xy);
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
			}

			// get number of items to set popup size
			QueryString = "";

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
			QueryString += "&User=" + GetQueryString('user') + "&Collection=share&bbox=" + clickbbox + "&SELECTED=1";

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
			
		});
		
		//userAreaSelect event for feature is unselected
		userAreaSelect.events.register("featureunselected", this, function (e) {
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
				popup.destroy();
			}
		});
		
		map.addControl(userAreaSelect);
		userAreaSelect.activate();
	};
	

	function closePopup() {
			while (map.popups.length) {
				map.removePopup(map.popups[0]);
				popup.destroy();
			}			
	}
	

	function setLayerOpacity() {		
			if (layerUserAreaCluster.visibility == true) {
				if (map.zoom > 13) {
					layerUserAreaCluster.setOpacity(1);
				} else {
					layerUserAreaCluster.setOpacity(1);
				}
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
		}
	}
	function showGoogleSV(status, svlat, svlon, panolat, panolon) {
		if (status == 1) {
			//closeAllOpenItems();
			document.getElementById("googlemapiframe").src = "google-sv-share.html?zoom=" + lastZoom + "&lat=" + lastCoordinates.lat + "&lon=" + lastCoordinates.lon + "&svlat=" + svlat + "&svlon=" + svlon + "&panolat=" + panolat + "&panolon=" + panolon + "&user=" + GetQueryString('user').toLowerCase();
			document.getElementById("google-map").style.display = "block";

			
		} else {
			document.getElementById("googlemapiframe").src = "about:blank";
			document.getElementById("google-map").style.display = "none";		
		}
	}