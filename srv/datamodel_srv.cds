using app.datamodel from '../db/datamodel';

service CatalogService{
    @odata.draft.enabled: false
    @cds.redirection.target: true
    entity HOUSING as projection on datamodel.HOUSING;
    @odata.draft.enabled: true
    entity MYHOUSING as projection on datamodel.HOUSING;
    entity PUBS as projection on datamodel.PUBS;
    @odata.draft.enabled: false
    entity HOUSING_RESERVATIONS as projection on datamodel.RESERVATION_HOUSING;
    entity PUBS_RESERVATIONS as projection on datamodel.RESERVATION_PUBS;
    entity PRODUCT as projection on datamodel.PRODUCT;
    entity MENU as projection on datamodel.MENU;
    entity TAXI as projection on datamodel.TAXI;
    entity BUS as projection on datamodel.BUS;
    entity TICKET as projection on datamodel.TICKET;
    entity BUS_TICKET as projection on datamodel.BUS_TICKET;
    entity HISTORY as projection on datamodel.HISTORY;
    entity EXCHANGE_RATES as projection on datamodel.EXCHANGE_RATES;
    entity HOUSING_IMAGES as projection on datamodel.HOUSING_IMAGES;
    entity HOUSING_FEEDBACK as projection on datamodel.HOUSING_FEEDBACK;

    function fidelityBonus(userEmail:String, placeId:String) returns Double;
    function getHousingNameByHousingId(housingId: String) returns String;
    function exchange() returns Double;
    function getRecommendedForUser() returns String;
    function testEntity() returns String;
    function getAllReservationsByUser(userEmail:String) returns String;
    function insertReservationHousing(placeId:String, nrPersons:Integer, date:String, nrNights:Integer, price:Integer) returns String;
    function cancelReservationHousing(placeId:String) returns String;
    function approveReservationHousing(placeId:String) returns String;
    function getReservationsByHotelEmail(email: String) returns String;
    function getImagesByHousingId(id: String) returns array of HOUSING_IMAGES;
    function isHousingReservationRated(reservationId:String) returns Boolean;
    function insertHousingFeedback(rating:Integer, description:String, reservationId:String) returns String;
    function editHousingFeedback(rating:Integer, description:String, reservationId:String) returns String;
    function getHousingFeedback(reservationId: String) returns array of HOUSING_FEEDBACK;
    function getAllHousingFeedback(placeId: String) returns array of HOUSING_FEEDBACK;
    function getFeedbackRatingForHousing(placeId: String) returns Double;
    function getNumberOfFeedbackForHousing(placeId: String) returns Integer;
    function cleanUpOldReservations() returns String;
    function updateCompletedReservations() returns String;
    function getTodayDate() returns String;
    function getFullyBookedDatesForHousing(housingId: String, year: Integer, month: Integer) returns String;
    function getAvailableCapacityForPeriod(housingId: String, day: Integer, month: Integer, year:Integer, nights: Integer) returns Integer;
    function insertHousing(type: String, name: String, email: String, phone: String, address: String, currency: String, stars: Integer, pricePerNight: Integer, capacity: Integer, description: String) returns Boolean;
    function getHousingAddresses() returns String;
    function getPreferredHousingAddress(userEmail:String) returns String;
}