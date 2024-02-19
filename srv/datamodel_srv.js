const cds = require('@sap/cds');
const { error } = require('@sap/hdi-deploy/lib/logger');

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
        EXCHANGE_RATES
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
            let sUserEmail = 'hori6c@gmail.com';
            let sPlaceId = '37DE1000-DB99-42BE-1800-91FA0E1991E0';
            //let sUserEmail = req.data.userEmail;
            //let sPlaceId = req.data.placeId;

            let qReservations = SELECT.from(HOUSING_RESERVATIONS).where({ CLIENT_EMAIL: sUserEmail, PLACE_ID_ID: sPlaceId, STATUS: 'approved' })
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
        let sUserEmail = 'hori6c@gmail.com';
        let iTotalNumber = 3;
        //let sUserEmail = req.data.userEmail;
        //let iTotalNumber = req.data.iTotalNumber;

        let qUserReservations = SELECT.from(HOUSING_RESERVATIONS, hr => { hr.PLACE_ID(h => { h.STARS }) }).where({ CLIENT_EMAIL: sUserEmail, STATUS: 'approved' });

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

});           