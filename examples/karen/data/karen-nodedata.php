<?
    $nodes = Array(
	/***************************************/
	"anx1-waun" => Array(
	    // name that should be displayed everywhere for this node
	    "fullname" => "Auckland",
	    // position given in x,y coords from the top left of screen
	    "position" => "250 220",
	    // position around node the label should be anchored
	    "labeloffset" => "E",
	    "icon" => "/home/httpd/weathermap.karen.net.nz/config/images/large-blue-node.png",
	    // all nodes that this one is connected to
	    "graphlinks" => Array(
		// nodename
		"anx11-masc" => Array(
		    // bandwidth of link
		    "bw" => "10G",
		    // suffix applied to top level node to create rrd name
		    // eg, for this link the rrd is 'anx1-waun_6.1-masc'
		    "rrd" => "2001-anx11-masc",
		),
		"anx12-tsnp" => Array(
		    "bw" => "10G",
		    "rrd" => "4001-anx12-tsnp",
		    "linkoffset" => "N70",
		),
		"waun-tsnp2" => Array(
		    "realtarget" => "anx12-tsnp",
		    "bw" => "10G",
		    "rrd" => "2.4-qeen",
		    "linkoffset" => "S70",
		),
		"anx14-innp" => Array(
		    "bw" => "10G",
		    "rrd" => "2004-anx14-innp",
		),
		"anx15-hepn" => Array(
		    "bw" => "10G",
		    "rrd" => "4004-hepn",
		),
		"lax" => Array(
		    "bw" => "655M",
		    "rrd" => "3.1-lax",
		),
		"sydney" => Array(
		    "bw" => "122M",
		    "rrd" => "3.1-sydney",
		),
	    ),
	),
	/***************************************/
	"anx2-lmtn" => Array(
	    "fullname" => "Wellington",
	    "position" => "650 300",
	    "labeloffset" => "NW",
	    "icon" => "/home/httpd/weathermap.karen.net.nz/config/images/large-blue-node.png",
	    "graphlinks" => Array(
		"anx3-cscc" => Array(
		    "bw" => "10G",
		    "rrd" => "4.4-cscc",
		),
		"anx4-otun" => Array(
		    "bw" => "1G",
		    "rrd" => "4.4-cscc",
		),
		"anx15-hepn" => Array(
		    "bw" => "10G",
		    "rrd" => "4.1-hepn",
		),
		"anx17-nfuw" => Array(
		    "bw" => "10G",
		    "rrd" => "4.1-nfuw",
		),
		"anx18-neln" => Array(
		    "bw" => "10G",
		    "rrd" => "2.4-neln",
		),
	    ),
	),
	/***************************************/
	"anx3-cscc" => Array(
	    "fullname" => "Christchurch",
	    "position" => "800 300",
	    "labeloffset" => "N",
	    "graphlinks" => Array(
		"anx2-lmtn" => Array(
		    "bw" => "10G",
		    "rrd" => "4.1-lmtn",
		),
		"anx20-linu" => Array(
		    "bw" => "10G",
		    "rrd" => "6.1-linu",
		),
		"anx18-neln" => Array(
		    "bw" => "10G",
		    "rrd" => "2.1-neln",
		),
	    ),
	),
	/***************************************/
	"anx4-otun" => Array(
	    "fullname" => "Dunedin",
	    "position" => "800 200",
	    "labeloffset" => "W",
	    "icon" => "/home/httpd/weathermap.karen.net.nz/config/images/large-blue-node.png",
	    "graphlinks" => Array(
		"anx2-lmtn" => Array(
		    "bw" => "10G",
		    "rrd" => "4.1-lmtn",
		),
		"anx20-linu" => Array(
		    "bw" => "10G",
		    "rrd" => "6.1-linu",
		),
		"anx21-resz" => Array(
		    "bw" => "10G",
		    "rrd" => "6.1-resz",
		),
		"inv" => Array(
		    "bw" => "1G",
		    "rrd" => "6.1-inv",
		),
	    ),
	),
	/***************************************/
	"anx11-masc" => Array(
	    "fullname" => "Mount Albert",
	    "position" => "250 375",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx1-waun" => Array(
		    "bw" => "10G",
		    "rrd" => "1025-waun",
		),
	    ),
	),
	/***************************************/
	"anx12-tsnp" => Array(
	    "fullname" => "North Shore",
	    "position" => "100 220",
	    "labeloffset" => "NW",
	    "graphlinks" => Array(
		"anx1-waun" => Array(
		    "bw" => "10G",
		    "rrd" => "25-waun",
		    "linkoffset" => "N",
		),
		"waun-tsnp2" => Array(
		    "bw" => "10G",
		    "rrd" => "25-waun",
		    "realtarget" => "anx1-waun",
		    "linkoffset" => "S",
		),
		"wkka" => Array(
		    "bw" => "1G",
		    "rrd" => "4-and23-wkka",
		),
	    ),
	),
	/***************************************/
	"anx13-frir" => Array(
	    "fullname" => "Rotorua",
	    "position" => "400 200",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx14-innp" => Array(
		    "bw" => "10G",
		    "rrd" => "25-innp",
		),
		"anx22-napr" => Array(
		    "bw" => "10G",
		    "rrd" => "26-napr",
		),
		"tau" => Array(
		    "bw" => "1G",
		    "rrd" => "26-tau",
		),
	    ),
	),
	/***************************************/
	"anx14-innp" => Array(
	    "fullname" => "Hamilton",
	    "position" => "300 100",
	    "labeloffset" => "N",
	    "graphlinks" => Array(
		"anx1-waun" => Array(
		    "bw" => "10G",
		    "rrd" => "25-waun",
		),
		"anx13-frir" => Array(
		    "bw" => "10G",
		    "rrd" => "26-frir",
		),
	    ),
	),
	/***************************************/
	"anx15-hepn" => Array(
	    "fullname" => "Palmerston North",
	    "position" => "450 350",
	    "labeloffset" => "W",
	    "icon" => "/home/httpd/weathermap.karen.net.nz/config/images/large-blue-node.png",
	    "graphlinks" => Array(
		"anx1-waun" => Array(
		    "bw" => "10G",
		    "rrd" => "25-waun",
		),
		"anx2-lmtn" => Array(
		    "bw" => "10G",
		    "rrd" => "26-lmtn",
		),
		"anx16-mass" => Array(
		    "bw" => "10G",
		    "rrd" => "26-mass",
		),
		"npl" => Array(
		    "bw" => "1G",
		    "rrd" => "26-npl",
		),
		"wag" => Array(
		    "bw" => "1G",
		    "rrd" => "26-wag",
		),
	    ),
	),
	/***************************************/
	"anx16-mass" => Array(
	    "fullname" => "Massey",
	    "position" => "550 230",
	    "labeloffset" => "W",
	    "graphlinks" => Array(
		"anx15-hepn" => Array(
		    "bw" => "10G",
		    "rrd" => "25-hepn",
		),
		"anx17-nfuw" => Array(
		    "bw" => "10G",
		    "rrd" => "25-nfuw",
		),
		"anx22-napr" => Array(
		    "bw" => "10G",
		    "rrd" => "26-napr",
		),
	    ),
	),
	/***************************************/
	"anx17-nfuw" => Array(
	    "fullname" => "Lower Hutt",
	    "position" => "650 125",
	    "labeloffset" => "E",
	    "graphlinks" => Array(
		"anx2-lmtn" => Array(
		    "bw" => "10G",
		    "rrd" => "26-lmtn",
		),
		"anx16-mass" => Array(
		    "bw" => "10G",
		    "rrd" => "25-mass",
		),
		"por" => Array(
		    "bw" => "1G",
		    "rrd" => "25-por",
		),
	    ),
	),
	/***************************************/
	"anx18-neln" => Array(
	    "fullname" => "Nelson",
	    "position" => "650 450",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx2-lmtn" => Array(
		    "bw" => "10G",
		    "rrd" => "25-lmtn",
		),
		"anx3-cscc" => Array(
		    "bw" => "10G",
		    "rrd" => "26-cscc",
		),
	    ),
	),
	/***************************************/
/*
	"anx19-crof" => Array(
	    "fullname" => "Havelock North",
	    "position" => "500 50",
	    "labeloffset" => "E",
	    "graphlinks" => Array(
		// this one won't be a return link
		"anx22-napr" => Array(
		    "bw" => "10G",
		    "rrd" => "25-napr",
		),
	    ),
	),
*/
	/***************************************/
	"anx20-linu" => Array(
	    "fullname" => "Lincoln",
	    "position" => "950 300",
	    "labeloffset" => "E",
	    "graphlinks" => Array(
		"anx3-cscc" => Array(
		    "bw" => "10G",
		    "rrd" => "25-cscc",
		),
		"anx4-otun" => Array(
		    "bw" => "10G",
		    "rrd" => "25-otun",
		),
		"tpo" => Array(
		    "bw" => "1G",
		    "rrd" => "25-tpo",
		),
	    ),

	),
	/***************************************/
	"anx21-resz" => Array(
	    "fullname" => "Invermay",
	    "position" => "800 50",
	    "labeloffset" => "N",
	    "graphlinks" => Array(
		"anx4-otun" => Array(
		    "bw" => "10G",
		    "rrd" => "25-otun",
		),
	    ),
	),
	/***************************************/
	"anx22-napr" => Array(
	    "fullname" => "Napier",
	    "position" => "500 125",
	    "labeloffset" => "E",
	    "graphlinks" => Array(
		"anx13-frir" => Array(
		    "bw" => "10G",
		    "rrd" => "1.25-frir",
		),
		"anx16-mass" => Array(
		    "bw" => "10G",
		    "rrd" => "1.26-mass",
		),
		"gis" => Array(
		    "bw" => "1G",
		    "rrd" => "2.26-gis",
		),
	    ),
	),
	/***************************************/
	"wkka" => Array(
	    "fullname" => "Warkworth",
	    "position" => "50 310",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx12-tsnp" => Array(
		    "bw" => "1G",
		    /*"rrd" => "",*/
		),
	    ),
	),
	/***************************************/
	"tau" => Array(
	    "fullname" => "Tauranga",
	    "position" => "400 25",
	    "labeloffset" => "N",
	    "graphlinks" => Array(
		"anx13-frir" => Array(
		    "bw" => "1G",
		    "rrd" => "2.26-frir",
		),
	    ),
	),
	/***************************************/
	"gis" => Array(
	    "fullname" => "Gisborne",
	    "position" => "500 25",
	    "labeloffset" => "N",
	    "graphlinks" => Array(
		"anx22-napr" => Array(
		    "bw" => "1G",
		    "rrd" => "2.26-napr",
		),
	    ),
	),
	/***************************************/
	"npl" => Array(
	    "fullname" => "New Plymouth",
	    "position" => "350 450",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx15-hepn" => Array(
		    "bw" => "1G",
		    "rrd" => "2.26-hepn",
		),
	    ),
	),
	/***************************************/
	"wag" => Array(
	    "fullname" => "Wanganui",
	    "position" => "550 450",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx15-hepn" => Array(
		    "bw" => "1G",
		    "rrd" => "2.26-hepn",
		),
	    ),
	),
	/***************************************/
	"por" => Array(
	    "fullname" => "Porirua",
	    "position" => "650 25",
	    "labeloffset" => "N",
	    "graphlinks" => Array(
		"anx17-nfuw" => Array(
		    "bw" => "1G",
		    "rrd" => "2.26-nfuw",
		),
	    ),
	),
	/***************************************/
	"tpo" => Array(
	    "fullname" => "Tekapo",
	    "position" => "950 175",
	    "labeloffset" => "E",
	    "graphlinks" => Array(
		"anx20-linu" => Array(
		    "bw" => "1G",
		    "rrd" => "2.26-linu",
		),
	    ),
	),
	/***************************************/
	"inv" => Array(
	    "fullname" => "Inverness",
	    "position" => "950 100",
	    "labeloffset" => "N",
	    "graphlinks" => Array(
		"anx4-otun" => Array(
		    "bw" => "1G",
		    "rrd" => "2.26-otun",
		),
	    ),
	),
	/***************************************/
	/*
	"qeen" => Array(
	    "fullname" => "",
	    "position" => "970 300",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx3-cscc" => Array(
		    "bw" => "10G",
		    "linkoffset" => "NW",
		),
	    ),
	),
	*/
	/***************************************/
	/*
	"qeen" => Array(
	    "fullname" => "Queenstown",
	    "position" => "900 450",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx3-cscc" => Array(
		    "bw" => "10G",
		),
		"anx4-otun" => Array(
		    "bw" => "10G",
		),
	    ),
	),
	*/
	/***************************************/
	/*
	"international" => Array(
	    "fullname" => "International",
	    //"position" => "30 150",
	    "position" => "50 150",
	    "labeloffset" => "NE",
	    "graphlinks" => Array(
		"anx12-tsnp" => Array(
		    "bw" => "1G",
		    // no rrd in this direction
		),
	    ),
	),
	*/
	/***************************************/
	/*
	"vzb" => Array(
	    "fullname" => "Verizon",
	    "position" => "60 150",
	    "labeloffset" => "NE",
	    "graphlinks" => Array(
		"anx12-tsnp" => Array(
		    "bw" => "1G",
		    // no rrd in this direction
		),
		"anx1-waun" => Array(
		    "bw" => "1G",
		    // no rrd in this direction
		),
		"seattle" => Array(
		    "bw" => "622M",
		),
		"sydney" => Array(
		    "bw" => "155M",
		    "linkoffset" => "W",
		),
		"equinix" => Array(
		    "bw" => "155M",
		    "linkoffset" => "E",
		),
	    ),
	),
	*/
	/***************************************/
	"sydney" => Array(
	    "fullname" => "Sydney",
	    "position" => "50 75",
	    "labeloffset" => "S",
	    "graphlinks" => Array(
		"anx1-waun" => Array(
		    "bw" => "155M",
		    "rrd" => "equinix",
		),
	    ),
	),
	/***************************************/
	"lax" => Array(
	    "fullname" => "Los Angeles",
	    "position" => "125 45",
	    "labeloffset" => "N",
	    "graphlinks" => Array(
		"anx1-waun" => Array(
		    "bw" => "622M",
		    "rrd" => "pacwave",
		),
	    ),
	),
	/***************************************/
    );

?>
