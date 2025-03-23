const DB_NAME = "DataBase";
const STORE_NAME = "DataBaseStore";
const ID_KEY = "second_id";
const INDEX_KEY = "second_id_key";
const VERSION = 2;

const hasIndexedDB = !!window.indexedDB;

async function startDomain() {
  if (!hasIndexedDB) return;

  const request = openRequest();

  request.onerror = onError();
  request.onsuccess = onSuccess(request);
  request.onupgradeneeded = onUpgradeneeded();

  basicIndexedDbActions();
}

async function basicIndexedDbActions() {
  const id = await addData({ second_id: 1, name: "New Test data" });
  let element = await getDataById(id);

  console.log("Inital element", element);

  await editData({ ...element, name: "Test data Edited" });

  element = await getDataById(id);

  console.log("Edited element", element);

  await deleteData(id);
}

function openRequest() {
  return indexedDB.open(DB_NAME, VERSION);
}

function onError() {
  return (event) =>
    console.error(`Connection with ${DB_NAME} failed!`, event.target.errorCode);
}
function onSuccess(request) {
  return () => {
    const db = request.result;
    db.onversionchange = onVersionChange(db);
    console.log(`Connection with ${DB_NAME} opened with success!`);
  };
}

function onUpgradeneeded() {
  return (event) => {
    if (event.oldVersion > 1 || event.newVersion > 1) return;

    const store = event.target.result.createObjectStore(STORE_NAME, {
      keyPath: "id",
      autoIncrement: true,
    });
    store.createIndex(INDEX_KEY, ID_KEY);
  };
}

function onVersionChange(db) {
  db.close();
}

function conectionValues(db) {
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  return { transaction, store };
}

async function addData(data) {
  return new Promise((resolve, reject) => {
    const request = openRequest();

    request.onsuccess = () => {
      const db = request.result;
      const { transaction, store } = conectionValues(db);

      const query = store.add(data);

      query.onsuccess = () => {
        console.log("Element stored with success!");
        resolve(query.result);
      };

      query.onerror = () => {
        console.error("Element store fail!");
        reject("Error!");
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

async function editData(data) {
  return new Promise((resolve, reject) => {
    const request = openRequest();

    request.onsuccess = () => {
      const db = request.result;
      const { transaction, store } = conectionValues(db);

      const query = store.put(data);

      query.onsuccess = () => {
        console.log("Element edited with success!");
        resolve(query.result);
      };

      query.onerror = () => {
        console.error("Element edit fail!");
        reject("Error!");
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

async function deleteData(id) {
  return new Promise((resolve, reject) => {
    const request = openRequest();

    request.onsuccess = () => {
      const db = request.result;
      const { transaction, store } = conectionValues(db);

      const query = store.delete(id);

      query.onsuccess = () => {
        console.log("Element deleted with success!");
        resolve(query.result);
      };

      query.onerror = () => {
        console.error("Element delete fail!");
        reject("Error!");
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

async function getDataById(id) {
  return new Promise((resolve, reject) => {
    const request = openRequest();

    request.onsuccess = () => {
      const db = request.result;
      const { transaction, store } = conectionValues(db);

      const query = store.get(id);

      query.onsuccess = () => {
        console.log("Data retrieved with success!");
        resolve(query.result);
      };

      query.onerror = () => {
        console.error("Data retrieve fail!");
        reject("Error");
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

async function getAllData() {
  return new Promise((resolve, reject) => {
    const request = openRequest();

    request.onsuccess = () => {
      const db = request.result;
      const { transaction, store } = conectionValues(db);

      const query = store.getAll();

      query.onsuccess = () => {
        console.log("All data retrieved with success!");
        resolve(query.result);
      };

      query.onerror = () => {
        console.error("Data retrieve fail!");
        reject("Error");
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

async function getAllDataByIndex() {
  return new Promise((resolve, reject) => {
    const request = openRequest();

    request.onsuccess = () => {
      const db = request.result;
      const { transaction, store } = conectionValues(db);
      const secondIdIndex = store.index(INDEX_KEY);

      const query = secondIdIndex.getAll(1);

      query.onsuccess = () => {
        console.log("All data retrieved by indexwith success!");
        resolve(query.result);
      };

      query.onerror = () => {
        console.error("Data retrieve fail!");
        reject("Error");
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

startDomain();
