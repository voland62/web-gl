


function Gear (radius)
{
	
	this.radius = radius;
	this.n = 6;
	this.indices = [];//[0,1,2,0,2,3];
	this.mvMatrix = mat4.create();
	this.meshVertices = this.buildVertices();
	this.vertices = toFlat( this.meshVertices );
	
	
}

Gear.prototype.numVertices = function()
{
	return this.vertices.length / this.itemSize;
}

Gear.prototype.buildVertices = function()
{
	this.itemSize = 3;
	
	var halfSector = Math.PI / (this.n * 2);
	var polar = [
		[ - halfSector, 		0.25],
		[ - halfSector, 		1.0	],
		[ - halfSector * 0.7, 	1.25],
		[   halfSector * 0.7, 	1.25],
		[   halfSector, 		1.0	],
		[   halfSector, 		0.25]
	];

	var teethIndeces = [
		0, 1, 4,
		1,2,3,
		3,4,1,
		4,5,0
	];
	
	//return;

	var doubleSector = halfSector * 4;
	var newPolar = [].concat( polar );
	var newIndeces = [].concat( teethIndeces );
	var shift;

	//--- produce flat gear ---------------------
	for (var i = 1; i < this.n ; i++) {
		for (var j = 0; j < polar.length; j++) {
			newPolar.push( [polar[j][0] + doubleSector * i, polar[j][1]] );
		};

		shift = polar.length * i;
		for (var j = 0; j < teethIndeces.length; j++) {
			newIndeces.push ( teethIndeces[j] + shift);
		};

		newIndeces.push( 	shift + 1 ,shift - 1,shift - 2,
							shift, shift - 1,  shift + 1
							);

	};
	
	//--- close strip --------------------------
	shift = polar.length * this.n;
	newIndeces.push ( 	 0, shift - 1, 1,
	 					 shift - 1, shift - 2, 1 );
	//------------------------------------------

	//-- array from polar to cartesian and z coord added -----
	var newCart = [];
	for (var i = 0; i < newPolar.length; i++) {
		var coord = polarToCart( newPolar[i]);
		newCart.push ( [coord[0], coord[1] , 0] ) ;
	};

	

	//--- clone face -------------------------------------

	thickness = 1;
	cloneCart = [];
	for (var i = 0; i < newCart.length; i++) {
		cloneCart.push( [newCart[i][0], newCart[i][1], newCart[i][2] + thickness] );
	};

	cloneIndeces = [];
	for (var i = 0; i < newIndeces.length; i++) {
		cloneIndeces.push( newIndeces[i] + newCart.length );
	};
	//-------------------------------------------------------
	//--- border strip --------------------------------------
	var borderStrip = [];
	for (var i = 0; i < newCart.length - 2; i++) {

		var pos = i % polar.length;
		if ( pos != 4 && pos != 0 )
		{
			borderStrip.push ( 	i, i + newCart.length,  i + newCart.length + 1,
								i,  i + newCart.length + 1, i + 1);
		}else
		{
			var adjuster = ( pos == 0 )? 5: 3;
			borderStrip.push ( 	i, i + newCart.length,  i + newCart.length + adjuster,
								i,  i + newCart.length + adjuster, i + adjuster);
		}


	};
	//--- close border strip --------------------------------





	//log( borderStrip );

	newCart = newCart.concat( cloneCart );
	newIndeces = newIndeces.concat ( cloneIndeces, borderStrip );

		
	
	//--- normals --------------------
	var piramidNormals = [];

	//--- triangles ------------------
	var tris = [];

    for (var i = 0; i < newIndeces.length; i += 3) {
        var p0 = newCart[ newIndeces[i] ];
        var p1 = newCart[ newIndeces[i + 1]];
        var p2 = newCart[ newIndeces[i + 2]];

        var v1 = vec3.subtract(p1, p0, []); //p1 - p0;
        var v2 = vec3.subtract(p1, p2, []); //p1 - p2;

        var norm =  vec3.cross(v2, v1);// v1 * v2;
        //log( norm);

        vec3.normalize(norm ,norm);
        //log( norm);
        

        piramidNormals.push( norm, norm, norm);

        tris.push( p0, p1, p2);

        //--- lines ---------------
        //linesVertices.push ( p0 , vec3.add(p0, norm, []));
       // linesVertices.push ( p1 , vec3.add(p1, norm, []));
       // linesVertices.push ( p2 , vec3.add(p2, norm, []));

        //lineIndeces.push ( i , i + 1, i + 2, i + 3, i + 4, i + 5); glvao
         
    };

    this.triangles = toFlat ( tris );
    this.normals = toFlat ( piramidNormals );

	this.indices = newIndeces;
	return newCart;
}

function polarToCart ( polar )
{
	return [ polar[1] * Math.cos ( polar[0] ) ,polar[1] * Math.sin ( polar[0] ) ];
}

function toFlat (arr)
{
	var a = [];
	return a.concat.apply (a, arr);
}


Gear.prototype.toString = function ()
{
	var s = "";
	s += "rediuss:" + this.radius + "\n";
	s += this.mvMatrix + "\n";
	return s;
}
