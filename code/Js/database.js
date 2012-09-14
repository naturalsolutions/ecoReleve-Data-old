// ************************************ Gestion de la database
function initializeDB(){
						// initialise la base si elle n'existe pas
				try {
							if (window.openDatabase) {
								 window.db = openDatabase("ecoReleve", "1.0", "db ecoreleve", 20*1024*1024); // espace accordé à la BD: 20 MO
								
								requete = 'DROP TABLE IF EXISTS ecoReleve';
								clearTable(requete);
								requete = 'DROP TABLE IF EXISTS Ttaxon';
								clearTable(requete);
								
								// creer la table taxons
								var requete = 'CREATE TABLE IF NOT EXISTS ecoReleve (PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Sub NVARCHAR(100), '
												+ 'Farm NVARCHAR(100),Prospection BOOLEAN, Frequence INTEGER, Qualite NVARCHAR(100))';
								createTable(requete);
								
								var requete = 'CREATE TABLE IF NOT EXISTS Ttaxon (Ttax_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Thes_Status_Precision NVARCHAR(100), TCarac_Transmitter_Frequency NVARCHAR(100), '
												+ 'TCarac_Release_Ring_Code NVARCHAR(100), TCarac_Breeding_Ring_Code NVARCHAR(100), TCarac_Chip_Code NVARCHAR(100) )';
								createTable(requete);
							
								localStorage.setItem('dbCreated', true);
								// netoyer la BD
								if (!db)
									alert("Impossible d'ouvrir la bdd. Peut être un problème de version ou alors pas assez de quota d'espace disque disponible pour ce domaine.");
							//createTaxaTable(db);
							} else
								alert("Impossible d'ouvrir la base de données. Merci d'essayer avec un autre navigateur.");
					return db;
					} catch (err) { }
 }
function createTable(requete){
    var query = requete;
	db.transaction (function (trxn) {
		trxn.executeSql(
			query, //requete à executer
			[],  // parametres de la requete
			function (transaction, resultSet){  //success callback
			//	console.log('success');
			},
			function (transaction, error){  //error callback
			console.log('erreur dan la creation de la table');
			}
		);
	});
}
function clearTable(requete){
     //   var query = 'DROP TABLE IF EXISTS TObservations';
        db.transaction(function (trxn) {
            trxn.executeSql(
			requete, //requete à executer
			[],  // parametres de la requete
			function (transaction, resultSet) {  //success callback
			   // console.log('success netoyage de table');
			},
			function (transaction, error) {  //error callback
			    console.log('erreur suppression de table');
			}
		);
});								 
 } 
 function getItems(db, query, queryCallback){
	db.transaction(function(tx){
				tx.executeSql(query,[], queryCallback);
	});
}
function insertNewRow(requete, parametres){
  //  var query = requete;
    db.transaction(function (transaction) {
        transaction.executeSql(
			requete, //requete à executer
			parametres
		);
    });
}
function insertRow(requete){
  //  var query = requete;
    db.transaction(function (transaction) {
        transaction.executeSql(requete);
    });
}

function selectItems(req){
db.transaction(function (tx) {
   tx.executeSql(req, [], function (tx, results) {
   return results;
   /*var len = results.rows.length, i;
   msg = "<p>Found rows: " + len + "</p>";
   document.querySelector('#status').innerHTML +=  msg;
   for (i = 0; i < len; i++){
      alert(results.rows.item(i).log );
   }*/
 }, null);
});
}