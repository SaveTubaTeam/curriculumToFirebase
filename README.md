# curriculumToFirebase :shipit:
A simple localhost interface for SaveTuba developer tooling. It comprises of two parts: [curriculumToJSON](#1-curriculumtojson) and [JSONToFirebase](#2-jsontofirebase). Please reach out to _@jimothych_ with any questions.

### To get started:
```
git clone https://github.com/SaveTubaTeam/curriculumToFirebase.git
npm install
```

### Run the following to open up in localhost:
```
npm run dev
```



## 1. curriculumToJSON
Google OAuth w/ popup signin to run the Google Workspaces API. For the purpose of exporting SaveTuba's curriculum documents into JSON.

> [!NOTE]
> Use your **Lehigh email address** to signin. 
> Only users in the @lehigh.edu organization can access the API

## 2. JSONToFirebase
Firebase Auth w/ popup signin. Posts exported curriculum JSON with image metadata to Firebase Firestore.

1. **postDataSoft()** only overwrites curriculum content, leaving other metadata intact
2. **postDataHard()** wipes and resets all data in the given Grade. Use with caution!