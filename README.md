# curriculumToFirebase
A simple localhost interface for pushing Save Tuba curriculum from Google Docs into Firebase. It comprises of two parts: [curriculumToJSON](#1-curriculumtojson) and [JSONToFirebase](#2-jsontofirebase). Contact the dev team for access to the .env file.

### To get started:
```
git clone https://github.com/SaveTubaTeam/curriculumToFirebase.git
cd ./curriculumToFirebase
npm install
```

### Run the following to open up in localhost:
```
npm run dev
```

## 1. curriculumToJSON
Google OAuth w/ popup signin to run the Google Workspaces API. For the purpose of exporting SaveTuba's Google Doc curriculum documents into JSON. :shipit:

> [!NOTE]
> Use your **Lehigh email address** to signin. 
> Only users in the **@lehigh.edu** organization can access the API.

## 2. JSONToFirebase
Firebase Auth w/ popup signin to access the Firestore and Cloud Storage bucket APIs. JSONToFirebase posts JSON curriculum plus image metadata into Firestore.

> [!IMPORTANT]
> 1. **postDataSoft()** overwrites curriculum content whilst leaving other metadata intact.
> 2. **postDataHard()** wipes and resets all data in the given Grade. Use with caution!
> 3. **Get Image Attributes** accepts a filepath to a preexisting image within our storage bucket and returns two attributes: a downloadURL and a blurhash for the image.