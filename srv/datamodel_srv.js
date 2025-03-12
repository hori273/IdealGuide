const cds = require('@sap/cds');
const { select } = require('@sap/cds/libx/_runtime/hana/execute');
const { error } = require('@sap/hdi-deploy/lib/logger');
const { json } = require('express');

module.exports = cds.service.impl(async function () {
    /*** SERVICE ENTITIES ***/
    const {
        HOUSING,
        PUBS,
        HOUSING_RESERVATIONS,
        PUBS_RESERVATIONS,
        PRODUCT,
        MENU,
        TAXI,
        BUS,
        TICKET,
        BUS_TICKET,
        HISTORY,
        EXCHANGE_RATES,
        HOUSING_IMAGES,
        HOUSING_FEEDBACK
    } = this.entities;

    this.on("testEntity", async (req) => {
        const tx = cds.transaction(req);
        let qHousings = SELECT.from(HOUSING);
        const aHousings = await tx.run(
            qHousings
        ).catch(function (error) {
            console.warn(error);
            return null;
        });
        return (JSON.stringify(aHousings));
    });

    this.on("fidelityBonus", async (req) => {
        try {
            const tx = cds.transaction(req);
            //let sUserEmail = 'hori6c@gmail.com';
            //let sPlaceId = '37DE1000-DB99-42BE-1800-91FA0E1991E0';
            let sUserEmail = req.data.userEmail;
            let sPlaceId = req.data.placeId;

            let qReservations = SELECT.from(HOUSING_RESERVATIONS).where({ CLIENT_EMAIL: sUserEmail, PLACE_ID_ID: sPlaceId, STATUS: 'completed' })
            const aReservations = await tx.run(
                qReservations
            ).catch(function (error) {
                console.warn(error);
                return null;
            });
            let iNrRezervations = aReservations.length;

            if (iNrRezervations >= 20)
                return 0.75;
            if (iNrRezervations >= 10)
                return 0.85;
            if (iNrRezervations >= 5)
                return 0.9;
            if (iNrRezervations >= 3)
                return 0.95;
            return 1.0;

        } catch (error) { console.log(error); }
    });

    this.on("exchange", async (req) => {
        try {
            const tx = cds.transaction(req);
            let dAmount = 100;
            let sFrom = 'ron';
            let sConvertTo = 'eur';
            /*let dAmount = req.data.amount; 
            let sFrom = req.data.from;
            let sConvertTo = req.data.convertTo;*/

            let sName = sFrom + '/' + sConvertTo;
            sName = sName.toUpperCase();

            let qExchangeRate = SELECT.from(EXCHANGE_RATES).where({ NAME: sName })
            const aExchangeRate = await tx.run(
                qExchangeRate
            ).catch(function (error) {
                console.warn(error);
                return null;
            });

            let result = dAmount / aExchangeRate[0].VALUE;
            return parseFloat(result.toFixed(2));

        } catch (error) { console.log(error); }
    });

    this.on("getRecommendedForUser", async (req) => {
        const tx = cds.transaction(req);
        let sUserEmail = 'andrei.kalman@nttdata.com';
        let iTotalNumber = 3;
        //let sUserEmail = req.data.userEmail;
        //let iTotalNumber = req.data.iTotalNumber;

        let qUserReservations = SELECT.from(HOUSING_RESERVATIONS, hr => { hr.PLACE_ID(h => { h.STARS }) }).where({ CLIENT_EMAIL: sUserEmail, STATUS: 'completed' });

        const aUserResevations = await tx.run(
            qUserReservations
        ).catch(function (error) {
            console.warn(error);
            return null;
        });

        let iStarsSum = 0;
        for(let i=0; i<aUserResevations.length; i++)
            iStarsSum += aUserResevations[i].PLACE_ID.STARS;

        let dAverageStars = iStarsSum / aUserResevations.length;

        let qHotelsWithoutReservations = SELECT
            .from(HOUSING)
            .where(`ID NOT IN (SELECT PLACE_ID_ID FROM ${HOUSING_RESERVATIONS} WHERE CLIENT_EMAIL = '${sUserEmail}')`);

        const aHotelsWithoutReservations = await tx.run(
            qHotelsWithoutReservations
        ).catch(function (error) {
            console.warn(error);
            return null;
        });

        aHotelsWithoutReservations.sort((hotelA, hotelB) => {
            let differenceA = Math.abs(dAverageStars - hotelA.STARS);
            let differenceB = Math.abs(dAverageStars - hotelB.STARS);
            return differenceA - differenceB;
        });

        let aSlicedHotelsWithoutReservations = []
        if(iTotalNumber < aHotelsWithoutReservations.length)
            aSlicedHotelsWithoutReservations = aHotelsWithoutReservations.slice(0, iTotalNumber);

        return JSON.stringify(aSlicedHotelsWithoutReservations);
    });

    this.on("getHousingNameByHousingId", async (req) => {
        const tx = cds.transaction(req);
        let sHotelId = req.data.housingId; 
    
        let qName = SELECT.from(HOUSING).where({ ID: sHotelId })
            const aName = await tx.run(
                qName
            ).catch(function (error) {
                console.warn(error);
                return null;
            });

        let result = aName[0].NAME;
        return result;
    });

    async function getHousingNameByHousingId(housingId, tx) {
        let sHotelId = housingId; 
    
        let qName = SELECT.from(HOUSING).where({ ID: sHotelId })
            const aName = await tx.run(
                qName
            ).catch(function (error) {
                console.warn(error);
                return null;
            });

        let result = aName[0].NAME;
        return result;
    }
    

    this.on("getAllReservationsByUser", async(req) => {
        const tx = cds.transaction(req);
        let sUserEmail = req.data.userEmail;
        let qReservations = SELECT
        .from(HOUSING_RESERVATIONS)
        .where({ CLIENT_EMAIL: sUserEmail });

        const aReservations = await tx.run(
            qReservations
        ).catch(function (error) {
            console.warn(error);
            return null;
        });

        for (let reservation of aReservations) {
            const hotelName = await getHousingNameByHousingId(reservation.PLACE_ID_ID, tx);
            reservation.PLACE_ID_ID = hotelName;
        }

        return JSON.stringify(aReservations);
    });

    this.on("insertReservationHousing", async (req) => {
        const tx = cds.transaction(req);
        const { uuid } = cds.utils;
        let id = uuid();
        let id2=uuid();

        let sClientEmail='andrei.kalman@nttdata.com';
        //let sClientEmail = req.data.clientEmail;
        //let uPlaceId='37DE1000-DB99-42BE-1800-91FA0E1991E0';
        let uPlaceId = req.data.placeId;
        //let iNrPersons=2;
        let iNrPersons = req.data.nrPersons;
        //let iNrNights=2;
        let iNrNights = req.data.nrNights;
        //let iPrice=150;
        let iPrice = req.data.price;

        let sStatus = 'pending';
        //let dDateTime = new Date;
        let dDateTime = req.data.date;
        let sReturn='success';

         await tx.run(INSERT.into(HOUSING_RESERVATIONS).columns(
            'ID',
            'CLIENT_EMAIL',
            'PLACE_ID_ID',
            'NR_PERSONS',
            'NR_NIGHTS',
            'DATE_TIME',
            'TOTAL_PRICE',
            'STATUS').rows(
                [id, sClientEmail, uPlaceId, iNrPersons, iNrNights, dDateTime, iPrice, sStatus]))
         return sReturn;
    });

    this.on("cancelReservationHousing", async (req) => {
        const tx = cds.transaction(req);
        try {
            let sPlaceId = req.data.placeId;
    
            // Check if the reservation exists
            let qReservation = SELECT.from(HOUSING_RESERVATIONS).where({ ID: sPlaceId});
            const aReservation = await tx.run(qReservation);
    
            // Update the reservation status to "cancelled"
            await tx.run(
                UPDATE(HOUSING_RESERVATIONS)
                .set({ STATUS: 'cancelled' })
                .where({ ID: sPlaceId})
            );
    
            return `Reservation for place ID: ${sPlaceId} has been successfully cancelled.`;
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            return `Failed to cancel reservation for place ID: ${placeId}.`;
        }
    });

    this.on("approveReservationHousing", async (req) => {
        const tx = cds.transaction(req);
        try {
            let sPlaceId = req.data.placeId;
    
            // Check if the reservation exists
            let qReservation = SELECT.from(HOUSING_RESERVATIONS).where({ ID: sPlaceId});
            const aReservation = await tx.run(qReservation);
    
            // Update the reservation status to "cancelled"
            await tx.run(
                UPDATE(HOUSING_RESERVATIONS)
                .set({ STATUS: 'approved' })
                .where({ ID: sPlaceId})
            );
    
            return `Reservation for place ID: ${sPlaceId} has been successfully cancelled.`;
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            return `Failed to cancel reservation for place ID: ${placeId}.`;
        }
    });

    this.on("getReservationsByHotelEmail", async (req) => {
        const tx = cds.transaction(req);
        try {
            let sHotelEmail = req.data.email;
    
            // Get the hotels by email
            let qHotels = SELECT.from(HOUSING).where({ EMAIL: sHotelEmail });
            const aHotels = await tx.run(qHotels);
    
            if (aHotels.length === 0) {
                return `No hotels found with email: ${sHotelEmail}`;
            }
    
            // Collect all hotel IDs
            const aHotelIds = aHotels.map(hotel => hotel.ID);
    
            // Get all reservations for the hotels
            let qReservations = SELECT.from(HOUSING_RESERVATIONS).where({ PLACE_ID_ID: { in: aHotelIds } });
            const aReservations = await tx.run(qReservations);

            for (let reservation of aReservations) {
                const hotelName = await getHousingNameByHousingId(reservation.PLACE_ID_ID, tx);
                reservation.PLACE_ID_ID = hotelName;
            }
    
            return JSON.stringify(aReservations);
        } catch (error) {
            console.error("Error fetching reservations:", error);
            return `Failed to fetch reservations for hotel email: ${req.data.email}`;
        }
    });

    this.on("getImagesByHousingId", async (req) => {
        const tx = cds.transaction(req);
        try {
            let sHotelId = req.data.id;
    
            // Get the photos by id
            let qImages = SELECT.from(HOUSING_IMAGES).where({ PLACE_ID_ID: sHotelId });
            const aImages = await tx.run(qImages);
    
            if (aImages.length === 0) {
                return `No photos found for id: ${sHotelId}`;
            }
    
            return aImages;

        } catch (error) {
            console.error("Error fetching photos:", error);
            return `Failed to fetch photos for hotel id: ${req.data.id}`;
        }
    });

    this.on("isHousingReservationRated", async (req) => {
        const tx = cds.transaction(req);
        try {
            let sReservationId = req.data.reservationId;
            //let sUserEmail = req.data.userEmail;
    
            let qRated = SELECT.from(HOUSING_FEEDBACK).where({ RESERVATION_ID: sReservationId});
            const aRated = await tx.run(qRated);
    
            if (aRated.length === 0) {
                return false;
            }
    
            return true;

        } catch (error) {
            console.error("Error fetching reservations:", error);
            return `Failed to fetch data for: ${req.data.id}`;
        }
    });

    this.on("insertHousingFeedback", async (req) => {
        const tx = cds.transaction(req);
        
        const { uuid } = cds.utils;
        let id = uuid();

        let uReservationId = req.data.reservationId;
        let iRating = req.data.rating;
        let sDescription = req.data.description;
        
        let sDate = await this.getTodayDate();
        
        let sReturn='success';

         await tx.run(INSERT.into(HOUSING_FEEDBACK).columns(
            'ID',
            'RATING',
            'DESCRIPTION',
            'RESERVATION_ID',
            'DATE').rows(
                [id, iRating, sDescription, uReservationId, sDate]))
         return sReturn;
    });

    this.on("editHousingFeedback", async (req) => {
        const tx = cds.transaction(req);
    
        let uReservationId = req.data.reservationId;
        let iRating = req.data.rating;
        let sDescription = req.data.description;
        let sDate = await this.getTodayDate();
        
        let sReturn = 'Feedback updated successfully';
    
        let qfeedback = SELECT.from(HOUSING_FEEDBACK).where({ RESERVATION_ID: uReservationId });
        const aFeedback = await tx.run(qfeedback);
        
        if (aFeedback.length === 0) {
            return `No existing feedback found for reservation: ${uReservationId}`;
        }
        
        await tx.run(
            UPDATE(HOUSING_FEEDBACK)
            .set({
                RATING: iRating,
                DESCRIPTION: sDescription,
                DATE: sDate
            })
            .where({ RESERVATION_ID: uReservationId })
        );
    
        return sReturn;
    });
    

    this.on("getHousingFeedback", async (req) => {
        const tx = cds.transaction(req);

        let uReservationId = req.data.reservationId;
        
        let qfeedback = SELECT.from(HOUSING_FEEDBACK).where({ RESERVATION_ID: uReservationId });
        const aFeedback = await tx.run(qfeedback);
    
        if (aFeedback.length === 0) {
            return `No feedback found for reservation: ${uReservationId}`;
        }
    
        return aFeedback;
    });

    this.on("getAllHousingFeedback", async (req) => {
        const tx = cds.transaction(req);
        
        let sPlaceId = req.data.placeId; 
        
        try {
            let qFeedback = SELECT.from(HOUSING_FEEDBACK)
                .where({ 'RESERVATION.PLACE_ID_ID': sPlaceId });
            
            const aFeedback = await tx.run(qFeedback);
    
            if (aFeedback.length === 0) {
                return `No feedback found for housing with ID: ${sPlaceId}`;
            }
    
            return aFeedback;
        
        } catch (error) {
            console.error("Error fetching feedback for housing:", error);
            return `Failed to fetch feedback for housing with ID: ${sPlaceId}`;
        }
    });

    this.on("getFeedbackRatingForHousing", async (req) => {
        const tx = cds.transaction(req);
        
        let sPlaceId = req.data.placeId;  
        
        try {
            let qFeedback = SELECT.from(HOUSING_FEEDBACK)
                .columns('RATING')
                .where({ 'RESERVATION.PLACE_ID_ID': sPlaceId });
            
            const aFeedback = await tx.run(qFeedback);
    
            if (aFeedback.length === 0) {
                return `No feedback found for housing with ID: ${sPlaceId}`;
            }
    
            let totalRating = aFeedback.reduce((acc, feedback) => acc + feedback.RATING, 0);
            let averageRating = totalRating / aFeedback.length;
    
            return parseFloat(averageRating.toFixed(2)); 
        
        } catch (error) {
            console.error("Error fetching feedback rating for housing:", error);
            return `Failed to fetch feedback rating for housing with ID: ${sPlaceId}`;
        }
    });

    this.on("getNumberOfFeedbackForHousing", async (req) => {
        const tx = cds.transaction(req);
        
        let sPlaceId = req.data.placeId; 
        
        try {
            let qFeedbackCount = SELECT.from(HOUSING_FEEDBACK)
                .where({ 'RESERVATION.PLACE_ID_ID': sPlaceId });
            
            const aFeedback = await tx.run(qFeedbackCount);
    
            if (aFeedback.length === 0) {
                return `No feedback found for housing with ID: ${sPlaceId}`;
            }
    
            return aFeedback.length;
        
        } catch (error) {
            console.error("Error fetching number of feedback for housing:", error);
            return `Failed to fetch feedback count for housing with ID: ${sPlaceId}`;
        }
    });

    this.on("cleanUpOldReservations", async (req) => {
        const tx = cds.transaction(req);
        const currentDate = new Date().toISOString().split('T')[0];
    
        try {
            await tx.run(
                DELETE.from(HOUSING_RESERVATIONS).where({ STATUS: 'cancelled' })
            );
    
            await tx.run(
                DELETE.from(HOUSING_RESERVATIONS)
                    .where({ STATUS: 'pending', DATE_TIME: { '<': currentDate } })
            );
    
            return `Succesfully cleaned up`
        } catch (error) {
            console.error("Error deleting old reservations:", error);
            return `Failed to delete old reservations.`;
        }
    });

    this.on("updateCompletedReservations", async (req) => {
        const tx = cds.transaction(req);
        const currentDate = new Date().toISOString().split('T')[0];
    
        try {
            await tx.run(
                UPDATE(HOUSING_RESERVATIONS)
                    .set({ STATUS: 'completed' })
                    .where({STATUS: 'approved', DATE_TIME: { '<': currentDate }})
            );
    
            return `Successfully updated completed reservations.`;
        } catch (error) {
            console.error("Error updating completed reservations:", error);
            return `Failed to update completed reservations.`;
        }
    });

    this.on("getTodayDate", async (req) => {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            
            const formattedDate = `${year}-${month}-${day}`;
            
            return formattedDate;
        } catch (error) {
            console.error("Error generating today's date:", error);
            return "Failed to generate today's date.";
        }
    });
    
    this.on("getFullyBookedDatesForHousing", async (req) => {
        const tx = cds.transaction(req);
        const housingId = req.data.housingId;
        const year = req.data.year;
        const month = req.data.month;
    
        try {
            // Get the total capacity for the specified housing
            const housing = await tx.run(SELECT.one.from(HOUSING).where({ ID: housingId }));
            const totalCapacity = housing.TOTAL_CAPACITY;
    
            // Calculate start and end dates for the given month and year
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // last day of the month

            const start = startDate.toISOString().split('T')[0];;
            const end = endDate.toISOString().split('T')[0];
    
            // Initialize a dictionary to track occupancy for each date in the month
            const occupancy = {};
    
            // Initialize occupancy for each date in the month
            for (let d = startDate.getDate(); d <= endDate.getDate(); d++) {
                const dateStr = new Date(year, month - 1, d).toISOString().split("T")[0];
                occupancy[dateStr] = 0;
            }
    
            // Retrieve all reservations for the specified housing within the given month
            const reservations = await tx.run(
                SELECT.from(HOUSING_RESERVATIONS)
                    .where({PLACE_ID_ID: housingId, DATE_TIME: { between: start, and: end} })
            );
    
            // Update occupancy based on each reservation
            for (const reservation of reservations) {
                const { DATE_TIME: startDate, NR_NIGHTS: nights, NR_PERSONS: persons } = reservation;
    
                // Calculate occupancy for each night of the reservation
                for (let i = 0; i < nights; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(currentDate.getDate() + i);
                    const currentDateStr = currentDate.toISOString().split("T")[0];

                    const nextDate = new Date(currentDate);
                    nextDate.setDate(currentDate.getDate() + 1);
                    const nextDateStr = nextDate.toISOString().split("T")[0];
    
                    if (occupancy[nextDateStr] !== undefined) {
                        occupancy[nextDateStr] += persons;
                    }
                }
            }
    
            // Filter and return dates that are fully booked
            const fullyBookedDates = Object.keys(occupancy).filter(date => occupancy[date] >= totalCapacity);
            return JSON.stringify(fullyBookedDates);
    
        } catch (error) {
            console.error("Error fetching fully booked dates:", error);
            return [];
        }
    });

    this.on("getAvailableCapacityForPeriod", async (req) => {
        const tx = cds.transaction(req);
        const housingId = req.data.housingId;
        const day = req.data.day;
        const month = req.data.month;
        const year = req.data.year;
        const nights = req.data.nights;
    
        try {
            // Get the total capacity for the specified housing
            const housing = await tx.run(SELECT.one.from(HOUSING).where({ ID: housingId }));
            const totalCapacity = housing.TOTAL_CAPACITY;
    
            // Calculate start and end dates for the entire month
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // last day of the month
    
            // Initialize a dictionary to track occupancy for each date in the month
            const monthlyOccupancy = {};
            for (let d = 1; d <= endDate.getDate(); d++) {
                const dateStr = new Date(year, month - 1, d).toISOString().split("T")[0];
                monthlyOccupancy[dateStr] = 0;
            }
    
            // Retrieve all reservations for the specified housing within the given month
            const reservations = await tx.run(
                SELECT.from(HOUSING_RESERVATIONS)
                    .where({ PLACE_ID_ID: housingId, DATE_TIME: { between: startDate.toISOString().split('T')[0], and: endDate.toISOString().split('T')[0] } })
            );
    
            // Update monthly occupancy based on each reservation
            for (const reservation of reservations) {
                const { DATE_TIME: reservationStartDate, NR_NIGHTS: reservationNights, NR_PERSONS: persons } = reservation;
                const reservationStart = new Date(reservationStartDate);
    
                for (let i = 0; i < reservationNights; i++) {
                    const currentDate = new Date(reservationStart);
                    currentDate.setDate(currentDate.getDate() + i + 1);
                    const currentDateStr = currentDate.toISOString().split("T")[0];
    
                    if (monthlyOccupancy[currentDateStr] !== undefined) {
                        monthlyOccupancy[currentDateStr] += persons;
                    }
                }
            }
    
            // Create a dictionary with each day in the requested period
            const requestedPeriodOccupancy = {};
            const start = new Date(year, month - 1, day);
            for (let i = 0; i < nights; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(currentDate.getDate() + i);
                const currentDateStr = currentDate.toISOString().split("T")[0];
                requestedPeriodOccupancy[currentDateStr] = monthlyOccupancy[currentDateStr] || 0;
            }
    
            // Find the maximum occupancy in the requested period
            const maxOccupancyInPeriod = Math.max(...Object.values(requestedPeriodOccupancy));
    
            // Calculate available capacity by subtracting the maximum occupancy from total capacity
            const availableCapacity = Math.max(0, totalCapacity - maxOccupancyInPeriod);
    
            return availableCapacity;
    
        } catch (error) {
            console.error("Error calculating available capacity:", error);
            return null;
        }
    });
    
    this.on("insertHousing", async (req) => {
        const tx = cds.transaction(req);
        
        const { uuid } = cds.utils;
        let id = uuid();

        let sType = req.data.type;
        let sName = req.data.name;
        let sEmail = req.data.email;
        let sPhone = req.data.phone;
        let sAddress = req.data.address;
        let sCurrency = req.data.currency;
        let iStars = req.data.stars;
        let iPricePerNight = req.data.pricePerNight;
        let iCapacity = req.data.capacity;
        let sDescription = req.data.description;


         await tx.run(INSERT.into(HOUSING).columns(
            'ID',
            'TYPE',
            'NAME',
            'EMAIL',
            'PHONE',
            'ADDRESS',
            'PREFCURRENCY',
            'STARS',
            'PRICE_PER_NIGHT',
            'TOTAL_CAPACITY',
            'DESCRIPTION').rows(
                [id, sType, sName, sEmail, sPhone, sAddress, sCurrency, iStars, iPricePerNight, iCapacity, sDescription]))
         return true;
    });

    this.on("getHousingAddresses", async (req) => {
        const tx = cds.transaction(req);
        try {
            let qAddresses = SELECT.from(HOUSING).columns('ADDRESS');
            const aAddresses = await tx.run(qAddresses);
    
            if (aAddresses.length === 0) {
                return `No addresses found.`;
            }
            
            return JSON.stringify(aAddresses.map(row => row.ADDRESS));
    
        } catch (error) {
            console.error("Error fetching addresses:", error);
            return `Failed to fetch addresses.`;
        }
    });

    this.on("getPreferredHousingAddress", async (req) => {
        try {
            const tx = cds.transaction(req);
            let sUserEmail = req.data.userEmail;
    
            let qReservations = SELECT.from(HOUSING_RESERVATIONS)
                .where({ CLIENT_EMAIL: sUserEmail, STATUS: 'completed' });
    
            const aReservations = await tx.run(qReservations).catch(function (error) {
                console.warn(error);
                return null;
            });
    
            if (!aReservations || aReservations.length === 0) {
                return JSON.stringify({ error: "No completed reservations found for the user." });
            }
    
            let housingCount = {};
            for (let reservation of aReservations) {
                let housingId = reservation.PLACE_ID_ID;
                if (!housingCount[housingId]) {
                    housingCount[housingId] = 0;
                }
                housingCount[housingId]++;
            }
    
            let preferredHousingId = Object.keys(housingCount).reduce((a, b) => 
                housingCount[a] > housingCount[b] ? a : b
            );
    
            let qHousing = SELECT.from(HOUSING).where({ ID: preferredHousingId });
            const aHousing = await tx.run(qHousing).catch(function (error) {
                console.warn(error);
                return null;
            });
    
            if (!aHousing || aHousing.length === 0) {
                return JSON.stringify({ error: "Preferred housing not found." });
            }
    
            let preferredHousing = aHousing[0];
            return JSON.stringify({
                name: preferredHousing.NAME,
                address: preferredHousing.ADDRESS
            });
    
        } catch (error) {
            console.log(error);
            return JSON.stringify({ error: "Error occurred while fetching preferred housing." });
        }
    });

});           