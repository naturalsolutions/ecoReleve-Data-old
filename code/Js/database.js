// ************************************ Gestion de la database
function initializeDB(){
// initialise la base si elle n'existe pas
	try {
		if (window.openDatabase) {
			 window.db = openDatabase("ecoReleveMobile", "1.0", "db ecoreleve", 20*1024*1024); // espace accordé à la BD: 20 MO
		
			/*
			requete = 'DROP TABLE IF EXISTS thesaurus';
			clearTable(requete);
			requete = 'DROP TABLE IF EXISTS TIndividus';
			clearTable(requete);
			*/
			requete = 'DROP TABLE IF EXISTS Ttracks';
			clearTable(requete);
			/*var requete = 'CREATE TABLE IF NOT EXISTS ecoReleve (PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Sub NVARCHAR(100), '
							+ 'Farm NVARCHAR(100),Prospection BOOLEAN, Frequence INTEGER, Qualite NVARCHAR(100))';
			createTable(requete);*/
			// creer la table individus
			var requete = 'CREATE TABLE IF NOT EXISTS TIndividus(Tind_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Tind_FieldWorker1 VARCHAR,'
			+'Tind_FieldWorker2 VARCHAR, Tind_FieldActivity_Name VARCHAR, Tind_Name VARCHAR, Tind_Region VARCHAR, Tind_Place VARCHAR, Tind_DATE VARCHAR,'
			+'Tind_LAT VARCHAR, Tind_LON VARCHAR, Tind_Site_name VARCHAR,Tind_MonitoredSite_type VARCHAR, Tind_label VARCHAR, Tind_Sex VARCHAR,'
			+'Tind_Origin VARCHAR, Tind_Species VARCHAR, Tind_Status VARCHAR, Tind_Tr_Shape VARCHAR, Tind_Tr_Model VARCHAR, Tind_Tr_Number VARCHAR,' 
			+ 'Tind_NumBagBre VARCHAR, Tind_Chip VARCHAR, Tind_TCaracThes_Mark_Color_1_Precision VARCHAR, Tind_PTT VARCHAR, Tind_Frequency VARCHAR,'
			+'Tind_NumBagRel VARCHAR, Tind_Fk_TInd_ID VARCHAR, Tind_FreqOpti VARCHAR)';
			createTable(requete);
			// table taxons (thesaurus)
			var requete = 'CREATE TABLE IF NOT EXISTS thesaurus (PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
							+ 'ereleveId VARCHAR ,Id_Type VARCHAR, Id_Parent VARCHAR, hierarchy VARCHAR, topic_fr VARCHAR, topic_en VARCHAR, definition_fr VARCHAR,'
							+ 'definition_en VARCHAR, Reference VARCHAR, available_EAU VARCHAR, available_Morocco VARCHAR )';
			createTable(requete);
			// table tracks
			/*var requete = 'CREATE TABLE IF NOT EXISTS Ttracks (PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, Ttra_coords VARCHAR)';
			createTable(requete);*/
			
			localStorage.setItem('mydbCreated', true);
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
 }, null);
});
}