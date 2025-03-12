sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/Image",
	"sap/ui/model/json/JSONModel"
], (Controller, History, MessageToast, Image, JSONModel) => {
	"use strict";

	return Controller.extend("idealguidefe1.controller.Detail", {
        map: null,   
        markers: [], 

		onInit() {
			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched, this);

			const oViewModel = new JSONModel({
                averageRating: 0,
				feedbackNumber: 0
            });
            this.getView().setModel(oViewModel, "viewModel");
		},

		async onObjectMatched(oEvent) {
			const sPath = "/" + window.decodeURIComponent(oEvent.getParameter("arguments").housingPath);
			const oView = this.getView();
		
			oView.bindElement({
				path: sPath,
				events: {
					dataReceived: async (oData) => {
						const oModelData = oData.getParameter("data");
						if (oModelData) {
							const sHousingId = oModelData.ID;
							console.log(sHousingId);
		
							await this._fetchFeedbacksAverageByHousingId(sHousingId);
		
							const aImages = await this._fetchImagesByHousingId(sHousingId);
							console.log(aImages);
							this._updateImageCarousel(aImages);
						} else {
							console.error("No data received for the given path.");
						}
					}
				}
			});
		},

		async _fetchFeedbacksAverageByHousingId(sHousingId){
			var oModel = this.getView().getModel("catalog");
			var getAverage = oModel.bindContext("/getFeedbackRatingForHousing(...)");

			var id = sHousingId;

			getAverage.setParameter("placeId", id);

			await getAverage.execute();
			var result = getAverage.getBoundContext().getObject();
			
			var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/averageRating", result.value);

			var getNumber = oModel.bindContext("/getNumberOfFeedbackForHousing(...)");
			getNumber.setParameter("placeId", id);

			await getNumber.execute();
			var result2 = getNumber.getBoundContext().getObject();
			oViewModel.setProperty("/feedbackNumber", result2.value);
		},

		async _fetchImagesByHousingId(sHousingId) {
			var oModel = this.getView().getModel("catalog");
			var getPhotos = oModel.bindContext("/getImagesByHousingId(...)");

			var id = sHousingId;

			getPhotos.setParameter("id", id);

			await getPhotos.execute();
			var result = getPhotos.getBoundContext().getObject();
			console.log(result);
			return result.value;
		},

		_updateImageCarousel(aImages) {
			const oCarousel = this.byId("imageCarousel");
			oCarousel.removeAllPages();

			for (var i = 0; i < aImages.length; i++) {
				const oImageControl = new Image({
					src: "./images/" + aImages[i].IMAGE
				});
				oCarousel.addPage(oImageControl);
			}
		},

		onNavBack() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("overview", {}, true);
			}
		},

		onGoToReservation: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			const oModelData = this.getView().getObjectBinding().getBoundContext("").getObject()
			const iPrice = oModelData.PRICE_PER_NIGHT;
			const sHousingId = oModelData.ID;
			oRouter.navTo("reservation", { id: sHousingId, price: iPrice });
		},

		onGoToFeedbacks: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			const oModelData = this.getView().getObjectBinding().getBoundContext("").getObject();
			const sHousingId = oModelData.ID;
			oRouter.navTo("feedbacks", { id: sHousingId});
		},

		formatAddress: function (sAddress) {
            if (sAddress) {
                return sAddress.split(",")[0];
            }
            return sAddress;
        },

		onShowMap: function () {
            const sGoogleMapsApiKey = "AIzaSyBpjxkuKN-6F0ULOG6gt34iXiQoWpmZfpA";
            const sScriptUrl = `https://maps.googleapis.com/maps/api/js?key=${sGoogleMapsApiKey}&callback=initMap&libraries=places`;

            const oView = this.getView();
            let oHtmlControl = oView.byId("mapContainer");

            if (!oHtmlControl) {
                console.error("Map container not found!");
                MessageToast.show("Error: Map container not found.");
                return;
            }

            oHtmlControl.setContent(`
                <div id='map' style='width: 100%; height: 400px;'></div>
                <input id='pac-input' class='controls' type='text' placeholder='Search Box' 
                style='box-sizing: border-box; border: 1px solid transparent; width: 240px; height: 32px; 
                margin-top: 10px; padding: 0 12px; border-radius: 3px; font-size: 14px; outline: none; 
                text-overflow: ellipsis; position: absolute; top: 10px; left: 50%; 
                transform: translateX(-50%); z-index: 5;'>
            `);

            if (!window.google || !window.google.maps) {
                const script = document.createElement("script");
                script.src = sScriptUrl;
                script.defer = true;
                script.async = true;
                script.onload = this.geocodeCenterAddress.bind(this);
                document.head.appendChild(script);
            } else {
                this.geocodeCenterAddress();
            }
        },

        geocodeCenterAddress: function () {
            const oModelData = this.getView().getObjectBinding()?.getBoundContext()?.getObject();
            
            if (!oModelData || !oModelData.ADDRESS) {
                console.error("Address data not available.");
                MessageToast.show("Error: Address data is not available.");
                return;
            }

            const centerAddress = oModelData.ADDRESS;

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: centerAddress }, (results, status) => {
                if (status === "OK") {
                    this.initMap(results[0].geometry.location);
                } else {
                    console.error("Geocoding failed for address:", centerAddress, "Status:", status);
                    MessageToast.show("Error: Could not find center location - " + centerAddress);
                }
            });
        },

        initMap: function (centerLocation) {
            const mapDiv = document.getElementById("map");
            if (!mapDiv) {
                console.error("Map div not found in DOM!");
                MessageToast.show("Error: Map div not found.");
                return;
            }

            if (this.map) {
                this.clearMarkers();  
                this.map.setCenter(centerLocation); 
                this.map.setZoom(15);
            } else {
                this.map = new google.maps.Map(mapDiv, {
                    center: centerLocation,
                    zoom: 15,
                    mapId: "8b7beeb0672f5679"
                });

                this.initSearchBox();
            }

            this.addMarker(centerLocation, "Main Location", "http://maps.google.com/mapfiles/ms/icons/red-dot.png");
        },

        initSearchBox: function () {
            const input = document.getElementById("pac-input");
            if (!input) {
                console.error("Search box input not found!");
                return;
            }

            const searchBox = new google.maps.places.SearchBox(input);
            this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

            searchBox.addListener("places_changed", () => {
                const places = searchBox.getPlaces();
                if (!places.length) return;

                const bounds = new google.maps.LatLngBounds();
                places.forEach((place) => {
                    if (!place.geometry || !place.geometry.location) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    this.addMarker(place.geometry.location, place.name, "http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });

                this.map.fitBounds(bounds);
                input.value="";
            });
        },

        addMarker: function (location, title, iconUrl) {
            const marker = new google.maps.Marker({
                position: location,
                map: this.map,
                title: title,
                icon: {
                    url: iconUrl,
                    scaledSize: new google.maps.Size(48, 48)
                }
            });

            this.markers.push(marker);
        },

        clearMarkers: function () {
            for (let marker of this.markers) {
                marker.setMap(null);
            }
            this.markers = []; 
        }
	});
});