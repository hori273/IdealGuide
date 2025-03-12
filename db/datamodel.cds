namespace app.datamodel;

entity HOUSING {
  key ID              : UUID;
      TYPE            : HOUSING_TYPE;
      NAME            : String;
      EMAIL           : String;
      PHONE           : String;
      ADDRESS         : String;
      PREFCURRENCY    : String;
      STARS           : Integer;
      PRICE_PER_NIGHT : Integer;
      TOTAL_CAPACITY  : Integer;
      DESCRIPTION     : String;
}

type HOUSING_TYPE : String enum {
  AIRBNB;
  HOTEL;
  PENSIUNE;
}


entity PUBS {
  key ID             : UUID;
      TYPE           : PUBS_TYPE;
      NAME           : String;
      EMAIL          : String;
      PHONE          : String;
      ADDRESS        : String;
      TOTAL_CAPACITY : Integer;
      MENU           : Association to MENU
                         on MENU.PUB_ID = $self;
}

type PUBS_TYPE    : String enum {
  PUB_LOUNGE;
  CAFENELE;
  COFETARII;
  PIZERII;
  RESTAURANTE;
}

entity HOUSING_IMAGES {
  key ID       : UUID;
      PLACE_ID : Association to HOUSING;
      IMAGE    :  String;
}

entity PUBS_IMAGES {
  key ID       : UUID;
      PLACE_ID : Association to PUBS;
      IMAGE    : String;
}

entity PRODUCT {
  key ID          : UUID;
      TYPE        : PRODUCT_TYPE;
      NAME        : String;
      DESCRIPTION : String;
      PRICE       : Integer;
      MENU_ID     : Association to MENU;
      PHOTO       : String;
      QUANTITY    : Integer;
      KCAL        : Integer;
}

type PRODUCT_TYPE : String enum {
  MANCARE;
  BAUTURA;
  DESERT;
}

entity MENU {
  key ID       : UUID;
      PUB_ID   : Association to PUBS;
      PRODUCTS : Association to PRODUCT
                   on PRODUCTS.MENU_ID = $self;
}

entity TAXI {
  key ID                 : UUID;
      NAME               : String;
      CONTACT            : String;
      PRICES_DESCRIPTION : String;
}

entity BUS {
  key ID          : UUID;
      BUS_NUMBER  : String;
      ROUTE_IMAGE : String;
      TICKETS     : Association to BUS_TICKET
                      on TICKETS.BUS_ID = $self;
}

entity TICKET {
  key ID          : UUID;
      PRICE       : Integer;
      PERIOD      : Integer;
      DESCRIPTION : String;
      BUSES       : Association to BUS_TICKET
                      on BUSES.TICKET_ID = $self;
}

entity BUS_TICKET {
  BUS_ID    : Association to BUS;
  TICKET_ID : Association to TICKET;
}

entity HISTORY {
  key ID           : UUID;
      NAME         : String;
      TYPE         : HISTORY_TYPE;
      ADDRESS      : String;
      IMAGE        : String;
      DESCRIPTION  : String;
      PRICE        : Integer;
      PREFCURRENCY : String;
}

type HISTORY_TYPE : String enum {
  CASA_MEMORIALA;
  MUZEU;
  MONUMENT;
  LOCAL_LEGEND;
  PERSONALITATE;
}

entity RESERVATION_HOUSING {
  key ID           : UUID;
      CLIENT_EMAIL : String;
      PLACE_ID     : Association to HOUSING;
      NR_PERSONS   : Integer;
      NR_NIGHTS    : Integer;
      DATE_TIME    : DateTime;
      TOTAL_PRICE  : Integer;
      STATUS       : String;
}

entity RESERVATION_PUBS {
  key ID           : UUID;
      CLIENT_EMAIL : String;
      PLACE_ID     : Association to PUBS;
      NR_PERSONS   : Integer;
      DATE_TIME    : DateTime;
      STATUS       : String;
}

entity EXCHANGE_RATES {
  key NAME  : String;
      VALUE : Double;
}

entity HOUSING_FEEDBACK {
  key ID :UUID;
      RESERVATION: Association to RESERVATION_HOUSING;
      RATING: Integer;
      DESCRIPTION: String;
      DATE: Date;
}
