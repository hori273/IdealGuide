using app.datamodel from '../db/datamodel';

service CatalogService{
    @odata.draft.enabled: false
    entity HOUSING as projection on datamodel.HOUSING;
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

    function fidelityBonus() returns Double;
    function exchange() returns Double;
    function getRecommendedForUser() returns String;
    function testEntity() returns String;
}