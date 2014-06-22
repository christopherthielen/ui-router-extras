(function () {
  "use strict";
  angular.module("ct.ui.router.extras.examples").service("exampleData", function () {
    return {
      managers: [
        {
          "id": 0,
          "age": 64,
          "eyeColor": "green",
          "name": "Bianca Haney",
          "gender": "female",
          "email": "biancahaney@insurity.com"
        },
        {
          "id": 1,
          "age": 58,
          "eyeColor": "evil",
          "name": "Tracy Rosario",
          "gender": "female",
          "email": "tracyrosario@insurity.com"
        },
        {
          "id": 2,
          "age": 42,
          "eyeColor": "evil",
          "name": "Samantha Garrett",
          "gender": "female",
          "email": "samanthagarrett@insurity.com"
        },
        {
          "id": 3,
          "age": 22,
          "eyeColor": "brown",
          "name": "Heidi Baird",
          "gender": "female",
          "email": "heidibaird@insurity.com"
        },
        {
          "id": 4,
          "age": 53,
          "eyeColor": "grey",
          "name": "Georgette Wolf",
          "gender": "female",
          "email": "georgettewolf@insurity.com"
        },
        {
          "id": 5,
          "age": 43,
          "eyeColor": "brown",
          "name": "Letha Swanson",
          "gender": "female",
          "email": "lethaswanson@insurity.com"
        }
      ],
      employees: [
        {
          "id": 0,
          "age": 28,
          "eyeColor": "blue",
          "name": "Sophia Richmond",
          "gender": "female",
          "manager": 3,
          "email": "sophiarichmond@accusage.com",
          "phone": "+1 (927) 426-2566",
          "address": "444 Harkness Avenue, Waterview, South Carolina, 9336"
        },
        {
          "id": 1,
          "age": 37,
          "eyeColor": "green",
          "name": "Newton Griffith",
          "gender": "male",
          "manager": 1,
          "email": "newtongriffith@accusage.com",
          "phone": "+1 (843) 428-2019",
          "address": "477 Canarsie Road, Rushford, New Hampshire, 913"
        },
        {
          "id": 2,
          "age": 20,
          "eyeColor": "green",
          "name": "Britney Fields",
          "gender": "female",
          "manager": 4,
          "email": "britneyfields@accusage.com",
          "phone": "+1 (893) 571-3845",
          "address": "121 Manor Court, Leroy, New York, 9815"
        },
        {
          "id": 3,
          "age": 36,
          "eyeColor": "green",
          "name": "Kirk Emerson",
          "gender": "male",
          "manager": 3,
          "email": "kirkemerson@accusage.com",
          "phone": "+1 (885) 436-2188",
          "address": "143 Olive Street, Clara, Alaska, 4900"
        },
        {
          "id": 4,
          "age": 39,
          "eyeColor": "brown",
          "name": "Sheri Burks",
          "gender": "female",
          "manager": 2,
          "email": "sheriburks@accusage.com",
          "phone": "+1 (944) 488-2465",
          "address": "354 Newkirk Placez, Wattsville, Vermont, 7883"
        },
        {
          "id": 5,
          "age": 31,
          "eyeColor": "blue",
          "name": "Alicia Chapman",
          "gender": "female",
          "manager": 1,
          "email": "aliciachapman@accusage.com",
          "phone": "+1 (896) 441-3227",
          "address": "357 Dahill Road, Davenport, Florida, 6419"
        },
        {
          "id": 6,
          "age": 31,
          "eyeColor": "brown",
          "name": "Sue Herring",
          "gender": "female",
          "manager": 2,
          "email": "sueherring@accusage.com",
          "phone": "+1 (808) 523-2940",
          "address": "717 Seacoast Terrace, Hanover, Utah, 423"
        },
        {
          "id": 7,
          "age": 29,
          "eyeColor": "blue",
          "name": "Terry Cox",
          "gender": "female",
          "manager": 2,
          "email": "terrycox@accusage.com",
          "phone": "+1 (927) 594-3001",
          "address": "221 Scholes Street, Camino, Kentucky, 4095"
        },
        {
          "id": 8,
          "age": 33,
          "eyeColor": "green",
          "name": "Roberson Gillespie",
          "gender": "male",
          "manager": 0,
          "email": "robersongillespie@accusage.com",
          "phone": "+1 (844) 494-2323",
          "address": "152 Hanover Place, Cumberland, Hawaii, 3890"
        },
        {
          "id": 9,
          "age": 28,
          "eyeColor": "brown",
          "name": "Amelia Blackburn",
          "gender": "female",
          "manager": 2,
          "email": "ameliablackburn@accusage.com",
          "phone": "+1 (928) 513-2212",
          "address": "248 Jefferson Street, Joes, Wisconsin, 9047"
        },
        {
          "id": 10,
          "age": 34,
          "eyeColor": "green",
          "name": "Solis Langley",
          "gender": "male",
          "manager": 1,
          "email": "solislangley@accusage.com",
          "phone": "+1 (972) 567-3274",
          "address": "657 Meeker Avenue, Movico, Massachusetts, 3945"
        },
        {
          "id": 11,
          "age": 25,
          "eyeColor": "green",
          "name": "Madelyn Vaughn",
          "gender": "female",
          "manager": 1,
          "email": "madelynvaughn@accusage.com",
          "phone": "+1 (977) 443-2637",
          "address": "409 Independence Avenue, Utting, Texas, 376"
        },
        {
          "id": 12,
          "age": 30,
          "eyeColor": "green",
          "name": "Lydia Mitchell",
          "gender": "female",
          "manager": 3,
          "email": "lydiamitchell@accusage.com",
          "phone": "+1 (827) 418-3594",
          "address": "979 Wogan Terrace, Robbins, Colorado, 8060"
        },
        {
          "id": 13,
          "age": 30,
          "eyeColor": "green",
          "name": "Michael Poole",
          "gender": "male",
          "manager": 2,
          "email": "michaelpoole@accusage.com",
          "phone": "+1 (808) 426-2304",
          "address": "980 India Street, Biddle, Georgia, 9974"
        },
        {
          "id": 14,
          "age": 33,
          "eyeColor": "brown",
          "name": "Le Moses",
          "gender": "male",
          "manager": 0,
          "email": "lemoses@accusage.com",
          "phone": "+1 (854) 529-3984",
          "address": "860 Boerum Street, Flintville, Connecticut, 7080"
        },
        {
          "id": 15,
          "age": 26,
          "eyeColor": "brown",
          "name": "Leta Mckee",
          "gender": "female",
          "manager": 0,
          "email": "letamckee@accusage.com",
          "phone": "+1 (847) 591-2255",
          "address": "162 Williamsburg Street, Loma, Missouri, 9447"
        },
        {
          "id": 16,
          "age": 34,
          "eyeColor": "green",
          "name": "Ramsey Beard",
          "gender": "male",
          "manager": 4,
          "email": "ramseybeard@accusage.com",
          "phone": "+1 (925) 483-3726",
          "address": "186 Nixon Court, Beyerville, South Dakota, 3759"
        },
        {
          "id": 17,
          "age": 31,
          "eyeColor": "blue",
          "name": "Dennis Mathis",
          "gender": "male",
          "manager": 4,
          "email": "dennismathis@accusage.com",
          "phone": "+1 (909) 507-2237",
          "address": "770 Elm Avenue, Nicut, Iowa, 6594"
        },
        {
          "id": 18,
          "age": 37,
          "eyeColor": "green",
          "name": "Pat Patel",
          "gender": "female",
          "manager": 3,
          "email": "patpatel@accusage.com",
          "phone": "+1 (838) 577-3862",
          "address": "386 Cropsey Avenue, Turpin, Minnesota, 5775"
        },
        {
          "id": 19,
          "age": 24,
          "eyeColor": "blue",
          "name": "Soto Rojas",
          "gender": "male",
          "manager": 3,
          "email": "sotorojas@accusage.com",
          "phone": "+1 (821) 564-3512",
          "address": "289 Rockaway Avenue, Curtice, Pennsylvania, 5235"
        },
        {
          "id": 20,
          "age": 34,
          "eyeColor": "green",
          "name": "Polly Townsend",
          "gender": "female",
          "manager": 2,
          "email": "pollytownsend@accusage.com",
          "phone": "+1 (848) 590-3965",
          "address": "300 Crown Street, Whitmer, Virginia, 738"
        },
        {
          "id": 21,
          "age": 33,
          "eyeColor": "brown",
          "name": "Marcella Nixon",
          "gender": "female",
          "manager": 1,
          "email": "marcellanixon@accusage.com",
          "phone": "+1 (838) 500-3543",
          "address": "760 Havens Place, Sparkill, Arkansas, 3221"
        },
        {
          "id": 22,
          "age": 25,
          "eyeColor": "green",
          "name": "Saundra Willis",
          "gender": "female",
          "manager": 1,
          "email": "saundrawillis@accusage.com",
          "phone": "+1 (937) 474-3856",
          "address": "781 Bowne Street, Tyro, Kansas, 2936"
        },
        {
          "id": 23,
          "age": 31,
          "eyeColor": "blue",
          "name": "Elizabeth Goff",
          "gender": "female",
          "manager": 0,
          "email": "elizabethgoff@accusage.com",
          "phone": "+1 (860) 463-3611",
          "address": "426 Boardwalk , Deseret, North Carolina, 8212"
        },
        {
          "id": 24,
          "age": 31,
          "eyeColor": "blue",
          "name": "Letitia Glass",
          "gender": "female",
          "manager": 3,
          "email": "letitiaglass@accusage.com",
          "phone": "+1 (956) 439-2053",
          "address": "287 Kingsland Avenue, Rowe, Ohio, 5155"
        },
        {
          "id": 25,
          "age": 38,
          "eyeColor": "green",
          "name": "Lowery Berger",
          "gender": "male",
          "manager": 0,
          "email": "loweryberger@accusage.com",
          "phone": "+1 (850) 537-2913",
          "address": "830 Suydam Place, Delshire, Illinois, 7890"
        },
        {
          "id": 26,
          "age": 24,
          "eyeColor": "brown",
          "name": "Lacey Boyd",
          "gender": "female",
          "manager": 3,
          "email": "laceyboyd@accusage.com",
          "phone": "+1 (854) 413-2858",
          "address": "400 Montauk Avenue, Gratton, California, 6736"
        },
        {
          "id": 27,
          "age": 40,
          "eyeColor": "green",
          "name": "Gwendolyn Cooley",
          "gender": "female",
          "manager": 0,
          "email": "gwendolyncooley@accusage.com",
          "phone": "+1 (910) 515-2931",
          "address": "670 Grimes Road, Wildwood, Maryland, 3347"
        },
        {
          "id": 28,
          "age": 33,
          "eyeColor": "blue",
          "name": "Natalia Duffy",
          "gender": "female",
          "manager": 0,
          "email": "nataliaduffy@accusage.com",
          "phone": "+1 (814) 594-2166",
          "address": "181 Bath Avenue, Levant, Tennessee, 3296"
        },
        {
          "id": 29,
          "age": 31,
          "eyeColor": "brown",
          "name": "Webster Mcdowell",
          "gender": "male",
          "manager": 2,
          "email": "webstermcdowell@accusage.com",
          "phone": "+1 (815) 597-2300",
          "address": "348 Calyer Street, Waumandee, Wyoming, 2890"
        },
        {
          "id": 30,
          "age": 22,
          "eyeColor": "green",
          "name": "Lawanda Hale",
          "gender": "female",
          "manager": 0,
          "email": "lawandahale@accusage.com",
          "phone": "+1 (963) 578-2972",
          "address": "721 Schermerhorn Street, Springville, North Dakota, 2390"
        },
        {
          "id": 31,
          "age": 40,
          "eyeColor": "blue",
          "name": "Dollie Washington",
          "gender": "female",
          "manager": 0,
          "email": "dolliewashington@accusage.com",
          "phone": "+1 (916) 542-3770",
          "address": "879 Vine Street, Chapin, West Virginia, 196"
        },
        {
          "id": 32,
          "age": 40,
          "eyeColor": "brown",
          "name": "Taylor Caldwell",
          "gender": "male",
          "manager": 1,
          "email": "taylorcaldwell@accusage.com",
          "phone": "+1 (837) 549-3493",
          "address": "152 Pierrepont Street, Sardis, Mississippi, 1893"
        },
        {
          "id": 33,
          "age": 30,
          "eyeColor": "green",
          "name": "Shelia Donovan",
          "gender": "female",
          "manager": 1,
          "email": "sheliadonovan@accusage.com",
          "phone": "+1 (802) 448-2198",
          "address": "229 Homecrest Avenue, Volta, Maine, 3619"
        },
        {
          "id": 34,
          "age": 28,
          "eyeColor": "brown",
          "name": "Virgie Johnson",
          "gender": "female",
          "manager": 1,
          "email": "virgiejohnson@accusage.com",
          "phone": "+1 (803) 580-2543",
          "address": "322 Jerome Street, Veyo, New Mexico, 2788"
        },
        {
          "id": 35,
          "age": 29,
          "eyeColor": "green",
          "name": "Bobbi Hebert",
          "gender": "female",
          "manager": 2,
          "email": "bobbihebert@accusage.com",
          "phone": "+1 (882) 520-2475",
          "address": "569 Java Street, Basye, Nebraska, 632"
        },
        {
          "id": 36,
          "age": 25,
          "eyeColor": "brown",
          "name": "Milagros Craig",
          "gender": "female",
          "manager": 3,
          "email": "milagroscraig@accusage.com",
          "phone": "+1 (920) 493-3840",
          "address": "962 Huntington Street, Castleton, Washington, 4855"
        },
        {
          "id": 37,
          "age": 40,
          "eyeColor": "blue",
          "name": "Susana Dunn",
          "gender": "female",
          "manager": 2,
          "email": "susanadunn@accusage.com",
          "phone": "+1 (842) 416-2607",
          "address": "552 Fleet Walk, Avoca, Michigan, 3186"
        },
        {
          "id": 38,
          "age": 36,
          "eyeColor": "blue",
          "name": "Dotson Singleton",
          "gender": "male",
          "manager": 3,
          "email": "dotsonsingleton@accusage.com",
          "phone": "+1 (904) 497-3624",
          "address": "460 Fay Court, Cornucopia, Montana, 2634"
        },
        {
          "id": 39,
          "age": 24,
          "eyeColor": "green",
          "name": "Jeanie Nunez",
          "gender": "female",
          "manager": 4,
          "email": "jeanienunez@accusage.com",
          "phone": "+1 (823) 463-2257",
          "address": "719 Coleman Street, Walton, Nevada, 7343"
        }
      ],
      stores: [
        {
          "id": 0,
          "name": "fugiat",
          "phone": "+1 (914) 550-2059",
          "address": "732 Crescent Street, Collins, Oregon, 9811",
          "tags": [
            "irure",
            "minim"
          ]
        },
        {
          "id": 1,
          "name": "exercitation",
          "phone": "+1 (834) 598-2541",
          "address": "501 Amity Street, Bowden, Delaware, 6951",
          "tags": [
            "amet",
            "qui"
          ]
        },
        {
          "id": 2,
          "name": "consequat",
          "phone": "+1 (827) 566-3778",
          "address": "998 Strauss Street, Haena, Illinois, 4859",
          "tags": [
            "Lorem",
            "eu"
          ]
        },
        {
          "id": 3,
          "name": "officia",
          "phone": "+1 (943) 450-3217",
          "address": "462 Independence Avenue, Hiwasse, Florida, 909",
          "tags": [
            "id",
            "incididunt"
          ]
        },
        {
          "id": 4,
          "name": "laborum",
          "phone": "+1 (835) 485-3720",
          "address": "771 Beacon Court, Madrid, Montana, 6334",
          "tags": [
            "voluptate",
            "eu"
          ]
        }
      ],
      products: [
        {
          "id": 0,
          "name": "fugiat ullamco",
          "store": 0,
          "price": "$2,369.29",
          "tags": [
            "voluptate"
          ]
        },
        {
          "id": 1,
          "name": "voluptate officia",
          "store": 1,
          "price": "$3,275.82",
          "tags": []
        },
        {
          "id": 2,
          "name": "ad occaecat",
          "store": 1,
          "price": "$1,617.66",
          "tags": [
            "ipsum"
          ]
        },
        {
          "id": 3,
          "name": "id elit",
          "store": 3,
          "price": "$1,084.07",
          "tags": []
        },
        {
          "id": 4,
          "name": "quis eu",
          "store": 2,
          "price": "$1,034.28",
          "tags": [
            "dolore",
            "ut",
            "deserunt"
          ]
        },
        {
          "id": 5,
          "name": "officia ullamco",
          "store": 3,
          "price": "$1,441.69",
          "tags": [
            "cillum"
          ]
        },
        {
          "id": 6,
          "name": "id officia",
          "store": 3,
          "price": "$3,827.63",
          "tags": []
        },
        {
          "id": 7,
          "name": "labore est",
          "store": 0,
          "price": "$1,096.10",
          "tags": [
            "et"
          ]
        },
        {
          "id": 8,
          "name": "velit sint",
          "store": 3,
          "price": "$2,450.53",
          "tags": [
            "aute"
          ]
        },
        {
          "id": 9,
          "name": "sit anim",
          "store": 3,
          "price": "$1,469.75",
          "tags": [
            "ut"
          ]
        },
        {
          "id": 10,
          "name": "quis est",
          "store": 3,
          "price": "$2,987.76",
          "tags": [
            "esse",
            "pariatur"
          ]
        },
        {
          "id": 11,
          "name": "proident sit",
          "store": 4,
          "price": "$1,196.56",
          "tags": [
            "exercitation"
          ]
        },
        {
          "id": 12,
          "name": "ad id",
          "store": 2,
          "price": "$1,854.62",
          "tags": [
            "ex",
            "adipisicing"
          ]
        },
        {
          "id": 13,
          "name": "ipsum deserunt",
          "store": 3,
          "price": "$1,670.21",
          "tags": []
        },
        {
          "id": 14,
          "name": "ullamco veniam",
          "store": 4,
          "price": "$2,377.26",
          "tags": [
            "magna",
            "id",
            "magna",
            "officia"
          ]
        },
        {
          "id": 15,
          "name": "esse aute",
          "store": 3,
          "price": "$1,059.99",
          "tags": [
            "aliqua",
            "in"
          ]
        },
        {
          "id": 16,
          "name": "velit minim",
          "store": 1,
          "price": "$3,856.39",
          "tags": []
        },
        {
          "id": 17,
          "name": "ex velit",
          "store": 1,
          "price": "$1,290.24",
          "tags": [
            "deserunt",
            "non",
            "officia",
            "ut"
          ]
        },
        {
          "id": 18,
          "name": "qui ad",
          "store": 1,
          "price": "$3,880.09",
          "tags": [
            "irure",
            "ut"
          ]
        },
        {
          "id": 19,
          "name": "laboris sint",
          "store": 3,
          "price": "$1,404.13",
          "tags": [
            "duis",
            "proident",
            "ad"
          ]
        },
        {
          "id": 20,
          "name": "sunt enim",
          "store": 0,
          "price": "$2,492.72",
          "tags": []
        },
        {
          "id": 21,
          "name": "exercitation irure",
          "store": 0,
          "price": "$2,226.77",
          "tags": [
            "eu"
          ]
        },
        {
          "id": 22,
          "name": "incididunt consectetur",
          "store": 4,
          "price": "$3,605.06",
          "tags": [
            "tempor",
            "duis"
          ]
        },
        {
          "id": 23,
          "name": "duis reprehenderit",
          "store": 4,
          "price": "$2,020.58",
          "tags": [
            "aliqua"
          ]
        },
        {
          "id": 24,
          "name": "officia enim",
          "store": 1,
          "price": "$1,671.19",
          "tags": []
        },
        {
          "id": 25,
          "name": "deserunt sint",
          "store": 1,
          "price": "$2,083.91",
          "tags": []
        },
        {
          "id": 26,
          "name": "ad sit",
          "store": 4,
          "price": "$3,277.34",
          "tags": [
            "elit",
            "velit"
          ]
        },
        {
          "id": 27,
          "name": "ex ea",
          "store": 3,
          "price": "$2,842.12",
          "tags": [
            "anim"
          ]
        },
        {
          "id": 28,
          "name": "ipsum non",
          "store": 0,
          "price": "$3,886.08",
          "tags": []
        },
        {
          "id": 29,
          "name": "aliqua eiusmod",
          "store": 1,
          "price": "$2,059.25",
          "tags": [
            "ea",
            "mollit",
            "deserunt"
          ]
        },
        {
          "id": 30,
          "name": "ipsum tempor",
          "store": 0,
          "price": "$3,151.38",
          "tags": [
            "veniam",
            "sint",
            "ipsum",
            "cupidatat"
          ]
        },
        {
          "id": 31,
          "name": "voluptate eu",
          "store": 2,
          "price": "$2,201.55",
          "tags": [
            "irure",
            "dolor",
            "dolor"
          ]
        },
        {
          "id": 32,
          "name": "commodo eiusmod",
          "store": 2,
          "price": "$3,920.05",
          "tags": []
        },
        {
          "id": 33,
          "name": "non nulla",
          "store": 1,
          "price": "$1,172.72",
          "tags": []
        },
        {
          "id": 34,
          "name": "ut non",
          "store": 2,
          "price": "$2,862.91",
          "tags": [
            "nisi",
            "non",
            "et",
            "minim"
          ]
        },
        {
          "id": 35,
          "name": "minim nostrud",
          "store": 3,
          "price": "$1,087.15",
          "tags": [
            "et",
            "magna",
            "laborum",
            "dolore"
          ]
        },
        {
          "id": 36,
          "name": "culpa sint",
          "store": 3,
          "price": "$3,373.29",
          "tags": [
            "duis",
            "occaecat",
            "amet",
            "culpa"
          ]
        },
        {
          "id": 37,
          "name": "magna sint",
          "store": 2,
          "price": "$2,484.37",
          "tags": [
            "duis"
          ]
        },
        {
          "id": 38,
          "name": "ad quis",
          "store": 3,
          "price": "$2,240.32",
          "tags": [
            "id",
            "do",
            "aliqua",
            "laboris"
          ]
        },
        {
          "id": 39,
          "name": "culpa fugiat",
          "store": 4,
          "price": "$3,296.75",
          "tags": [
            "elit",
            "consequat",
            "do"
          ]
        }
      ]
    }
  });
})();