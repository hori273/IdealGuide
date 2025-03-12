sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("addhousing.controller.AddHousing", {
        markers: [],

        onInit: function () {
            this.loadGoogleMaps();
        },

        loadGoogleMaps: async function () {
            const sGoogleMapsApiKey = "AIzaSyBpjxkuKN-6F0ULOG6gt34iXiQoWpmZfpA";
            const sScriptUrl = `https://maps.googleapis.com/maps/api/js?key=${sGoogleMapsApiKey}&callback=initMap&libraries=marker`;

            window.initMap = this.initMap.bind(this);

            await this.loadScript(sScriptUrl);
        },

        loadScript: function (url) {
            return new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = url;
                script.defer = true;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },

        initMap: function () {
            const oHtmlControl = this.getView().byId("mapContainer");

            if (!oHtmlControl) {
                console.error("Map div not found in DOM!");
                MessageToast.show("Error: Map div not found.");
                return;
            }
            oHtmlControl.setContent("<div id='map' style='width: 100%; height: 400px;'></div>");

            // Ensure the map div is in the DOM
            this.ensureMapDivReady(() => {
                const mapDiv = document.getElementById("map");
                if (!mapDiv) {
                    console.error("Map div not found in DOM!");
                    MessageToast.show("Error: Map div not found.");
                    return;
                }

                const geocoder = new google.maps.Geocoder();
                const centerAddress = "Strada Lucian Blaga, Mediaș, Romania";

                geocoder.geocode({ address: centerAddress }, (results, status) => {
                    if (status === "OK") {
                        const centerLocation = results[0].geometry.location;
                        const map = new google.maps.Map(mapDiv, {
                            center: centerLocation,
                            zoom: 15
                        });

                        map.addListener("click", (event) => {
                            this.geocodeLatLng(geocoder, map, event.latLng);
                        });
                    } else {
                        console.error("Geocoding failed for center address: " + status);
                        MessageToast.show("Geocoding failed for center address: " + status);
                    }
                });
            });
        },

        ensureMapDivReady: function (callback) {
            const checkDiv = () => {
                const mapDiv = document.getElementById("map");
                if (mapDiv) {
                    callback();
                } else {
                    requestAnimationFrame(checkDiv);
                }
            };
            checkDiv();
        },

        geocodeLatLng: function (geocoder, map, latLng) {
            geocoder.geocode({ location: latLng }, (results, status) => {
                if (status === "OK") {
                    if (results[0]) {
                        const address = results[0].formatted_address;
                        this.getView().byId("address").setValue(address);
                        this.clearMarkers();
                        const marker = new google.maps.Marker({
                            position: latLng,
                            map: map
                        });
                        this.markers.push(marker);
                    } else {
                        console.error("No results found");
                        MessageToast.show("No results found");
                    }
                } else {
                    console.error("Geocoder failed due to: " + status);
                    MessageToast.show("Geocoder failed due to: " + status);
                }
            });
        },
        
        clearMarkers: function () {
            for (let marker of this.markers) {
                marker.setMap(null);
            }
            this.markers = [];
        },

        onSubmit: async function () {
            const oView = this.getView();

            const sType          = oView.byId("typeSelect").getSelectedItem()?.getKey();
            const sName          = oView.byId("nameInput").getValue();
            const sEmail         = oView.byId("emailInput").getValue();
            const sPhone         = oView.byId("phoneInput").getValue();
            const sAddress       = oView.byId("address").getValue();
            const sCurrency      = oView.byId("currencySelect").getSelectedItem()?.getKey();
            const iStars         = oView.byId("starsIndicator").getValue();
            const iPricePerNight = oView.byId("priceInput").getValue();
            const iCapacity      = oView.byId("capacityInput").getValue();
            const sDescription   = oView.byId("description").getValue();
        
            // Get values of Total Capacity and Price Per Night fields
            const sTotalCapacity = oView.byId("capacityInput").getValue();
            const sPricePerNight = oView.byId("priceInput").getValue();
        
            // Regular expression to validate digits only
            const isValidNumber = /^[1-9]\d*$/;
        
            // Check for invalid characters in Price Per Night
            if (!isValidNumber.test(sPricePerNight)) {
                sap.m.MessageToast.show("Price Per Night must contain digits only.");
                oView.byId("priceInput").setValue("1"); // Reset the field
                return;
            }
        
            // Check for invalid characters in Total Capacity
            if (!isValidNumber.test(sTotalCapacity)) {
                sap.m.MessageToast.show("Total Capacity must contain digits only.");
                oView.byId("capacityInput").setValue("10"); // Reset the field
                return;
            }
    
                // Basic validation example
                if (!sType || !sName || !sEmail || !sPhone || !sAddress) {
                    MessageBox.error("Please fill in all required fields (Type, Name, Email, Phone, Address)!");
                    return;
                }
    
                const oModel = oView.getModel("catalog");
                console.log(oModel);
    
                const oInsertHousing = oModel.bindContext("/insertHousing(...)");
    
                // 4. Set each parameter expected by your backend function
                oInsertHousing.setParameter("type", sType);
                oInsertHousing.setParameter("name", sName);
                oInsertHousing.setParameter("email", sEmail);
                oInsertHousing.setParameter("phone", sPhone);
                oInsertHousing.setParameter("address", sAddress);
                oInsertHousing.setParameter("currency", sCurrency);
                oInsertHousing.setParameter("stars", parseInt(iStars, 10));
                oInsertHousing.setParameter("pricePerNight", parseInt(iPricePerNight, 10));
                oInsertHousing.setParameter("capacity", parseInt(iCapacity, 10));
                oInsertHousing.setParameter("description", sDescription);
    
                try {
                    // 5. Execute the call and handle response
                    await oInsertHousing.execute();
    
                    MessageToast.show("Housing inserted successfully!");
                    // Optionally, you could reset the fields or navigate back:
                    // oView.byId("typeSelect").setSelectedKey("");
                    // oView.byId("nameInput").setValue("");
                    // ...
    
                } catch (error) {
                    console.error("Error inserting housing:", error);
                }
            }
    
        });
});
