// This function is called to download a blob as a hidden link element
function downloadBlob(blob, title) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url); // Cleanup the object URL
};

let chaptersArray = []; //our global 1D array which will contain all text

//This function parses the given document into an array containing all of the chapter content, 
//and passes the array to formatJSON(). 
//@param doc the resultant google document from our get request in getDoc()
function parseDocument(doc) {

    //getting all content from document via forEach iteration
    doc.body.content.forEach((content) => { //getting each 'content' element

        if(content.paragraph) { //content is of type paragraph
            getParagraphContents(content, 'paragraph');

        } else if (content.table) { //content is of type table (maximum row number is 2!)
            const numColumns = content.table.columns;
            const tableTopRow = content.table.tableRows[0]; //categories
            const tableBottomRow = content.table.tableRows[1]; //individual contents matched to category

            for(let i=0; i<numColumns; i++) {//iterating through the table's columns
                tableTopRow.tableCells[i].content.forEach((content) => { //extracting top row
                    if(content.paragraph) {
                        getParagraphContents(content, `top-table-column${i}`);
                    }
                }) ;
                tableBottomRow.tableCells[i].content.forEach((content) => { //extracting bottom rows
                    if(content.paragraph) {
                        getParagraphContents(content, `bottom-table-column${i}`);
                    }
                });
            }// end of table iterations
        }//end of content type check

    }); //end of doc.body.content.forEach()

    //return JSON.stringify(doc, null, 2); //unparsed JSON
    return formatJSON();

}//end of parseDocument()

//Helper for parseDocument() to parse nested paragraph data
//@param content the current content array which holds a content.paragraph.elements array, which in itself carries the content under textRun.content
//@param type a string to specify an object type identifier when we push to chaptersArray
function getParagraphContents(content, type) {
    const paragraphElements = content.paragraph.elements; //grabbing the elements array which has all the text information we want

    let paragraphHeadingStyle = '';
    if(content.paragraph.paragraphStyle.namedStyleType) { //checking if this paragraph is styled as a header (i.e. Heading 1, Heading 2, etc.)
        paragraphHeadingStyle = content.paragraph.paragraphStyle.namedStyleType;
    } else { //this paragraph is regularly styled
        paragraphHeadingStyle = 'regular';
    }

    let paragraphText = ''; //there is a very small off chance that the elements array contains more than one textRun, which is why we have the .forEach() below
    let textStyle = ''; //checking if bold or regular
    paragraphElements.forEach((element) => { //looping through elements array (this is a basically paragraph broken by lines with a bunch of styling stuff for each line)
        if(element.textRun) { //textRun exists and its contents are valid
            paragraphText += element.textRun.content; //filtering out the text from each textRun object

            if(element.textRun.textStyle.backgroundColor) { //checking for null first
                if((element.textRun.textStyle.backgroundColor.color.rgbColor.red == 0.8509804) &&
                (element.textRun.textStyle.backgroundColor.color.rgbColor.green == 0.91764706) &&
                (element.textRun.textStyle.backgroundColor.color.rgbColor.blue == 0.827451)) { //checking if text is highlighted light green
                    textStyle += 'highlightedLightGreen';
                }
            }

            if(element.textRun.textStyle.bold) { //checking if text is bold
                textStyle += 'bold';
            }

        }
    })

    //if our text is not an empty string and if our text does not match the regex 'http', we push
    if((paragraphText.trim() !== "") && (!paragraphText.includes("http"))) {//checking for empty strings or regex matches to links.
        chaptersArray.push({ //pushing content into chaptersArray array
            type: type, //either table or paragraph
            text: paragraphText.replace(/[\n\t\u200B]/g, "").trim(), //trim() removes whitespace, .replace() is regex matching and removing all instance of new lines, tabs, and zero-width spaces
            headingStyle: paragraphHeadingStyle, //to detect chapters & lessons
            textStyle: textStyle //either bold or normal (bold for quiz questions)
        });
    }

}// end of getParagraphContents()

//this function will handle a maximum of 12 chapters before throwing an error
function getUniqueBgColor(chapterBgColors) {
   //safely resetting array w/ object destructuring if it is empty
  if(chapterBgColors.length === 0) { 
    console.error('No more color objects available. Exceeded max number of chapters.');
  }

  let randomNumber = Math.floor(Math.random() * chapterBgColors.length);
  let colorObject = chapterBgColors[randomNumber];
  chapterBgColors.splice(randomNumber, 1); //removing the object from the array at the index

  return colorObject;
}

//formatting our parsed document into the proper JSON format
function formatJSON() {
    let chapterBgColors = [ //colors attributes for Chapters
        {colorOne: 'indianred', colorTwo: 'firebrick'},
        {colorOne: 'mediumpurple', colorTwo: 'indigo'},
        {colorOne: 'orange', colorTwo: 'orangered'},
        {colorOne: 'mediumturquoise', colorTwo: 'midnightblue'},
        {colorOne: 'lightpink', colorTwo: 'mediumvioletred'},
        {colorOne: 'goldenrod', colorTwo: 'darkorange'},
        {colorOne: 'darkolivegreen', colorTwo: 'darkgreen'},
        {colorOne: 'skyblue', colorTwo: 'steelblue'},
        {colorOne: 'plum', colorTwo: 'orchid'},
        {colorOne: 'brown', colorTwo: 'maroon'},
        {colorOne: 'teal', colorTwo: 'seagreen'},
        {colorOne: 'lavender', colorTwo: 'darkslateblue'},
    ]

    const docData = { chapters: [] }; //initializing JSON object

    let chapterCount = 0;
    for(let i=0; i<chaptersArray.length; i++) {
        if(chaptersArray[i].headingStyle === 'HEADING_2') { //currently on a Chapter text
            console.log(chaptersArray[i].text);
            chapterCount++;
            let chapter = `Chapter${chapterCount}`;

            const colorObject = getUniqueBgColor(chapterBgColors);

            docData.chapters.push({ //creating and pushing this iteration of Chapter metadata into the chapters array
                navigation: chapter,
                title: `common:chapter${chapterCount}`, //translates to the actual chapter number
                name: `common:PLACEHOLDER`, //translates to the title of the chapter
                icon: 'assets/cotton.png',
                colorOne: colorObject.colorOne,
                colorTwo: colorObject.colorTwo,
                lessons: []
            })

            const lessonsData = lessonsIterator(i, chapterCount); //moving off of the 'HEADING_2' index before continuing iteration
            docData.chapters[chapterCount-1].lessons = lessonsData; //setting lessons array within docData object for this iteration of the chapter
        }
    }//end of entire document's for loop

    chaptersArray = []; //reset the array

    //return JSON.stringify(chaptersArray, null, 2); //default array
    return JSON.stringify(docData, null, 2); //formatting to JSON
} //end of formatJSON()

//collection of background colors for lesson cards
//each chapter should have lessons w/ a similar background color
//NO LONGER USED WITHIN THE APP
const LESSON_BACKGROUND_COLORS = [["#6C75EB", "#B56CEB", "#8C6BEB", "#6C9DEB", "#DF6CEB", "#C6BAEB"], //darker purples
                                  ["#DB5F5C", "#DB8C5C", "#DB755B", "#DB5C9E", "#DBA25C", "#DBB0A5"], //reds
                                  ["#74D3DB", "#7492DB", "#74B1DB", "#74DBC2", "#7874DB", "#BDCFDB"], //blues
                                  ["#E079A5", "#E09079", "#E07D78", "#DF79E0", "#E0A279", "#E0C5C4"], //oranges
                                  ["#8777E0", "#CC77E0", "#AA78E1", "#7788E0", "#E077C6", "#D1C2E0"]] //lighter purples

//@param startIndex the index directly after the current chapter in formatJSON()
//@param chapterCount the current chapter count (needed for lesson metadata) (indexed from 1)
function lessonsIterator(startIndex, chapterCount) {
    const lessonsData = []; //initializing lessonsData to be added into the docData object
    let j = startIndex + 1; //defining an independent iterator variable inside of lessonsIterator
    let lessonsCount = 1;

    while(j < chaptersArray.length && chaptersArray[j].headingStyle !== 'HEADING_2') { //iterating until the next chapter
        if(chaptersArray[j].headingStyle === 'HEADING_3') {
            console.log(`\t${chaptersArray[j].text} | Chapter${chapterCount}, Lesson${lessonsCount}`);

            let masteryAndMinigamesData = masteryAndMinigamesIterator(j); //returns an array containing all mastery and minigame objects in this lesson

            lessonsData.push({
                navigation: `Lesson${lessonsCount}`,
                title: `${lessonsCount}. ${chaptersArray[j].text.split(":")[1].trim()}`, //extracting everything after the colon
                thumbnail: "assets/cotton.png",
                backgroundColor: LESSON_BACKGROUND_COLORS[(chapterCount-1) % 4][lessonsCount % 5], //iteratively gets background color from predefined array
                content: masteryAndMinigamesData,
            });
            lessonsCount++; //lesson iterator
        }
        j++;
    }

    return lessonsData;
}

//defining emoji regex constants
const graduationCapEmoji = /\ud83c\udf93/;
const cameraEmoji = /\ud83d\udcf7/;
const notepadEmoji = /\ud83d\udcdd/;
const puzzlePieceEmoji = /\ud83e\udde9/;
const painterPaletteEmoji = /\ud83c\udfa8/;
const booksEmoji = /\ud83d\udcda/;
const brainEmoji = /\ud83e\udde0/;

//@param startIndex the index directly after the current lesson in lessonsIterator
//PLEASE NOTE: we assume that every lesson ends with a Mastery and no other type of minigame. This is crucial for the iterator to loop properly. Could cause problems if Google Doc is not formatted properly...
function masteryAndMinigamesIterator(startIndex) {
    //masteryAndMinigamesData is an array containing all of the minigames and mastery objects
    const masteryAndMinigamesData = []

    let k = startIndex + 1;
    while(k < chaptersArray.length && chaptersArray[k].headingStyle !== 'HEADING_3') { //iterating until next lesson
        if(chaptersArray[k].headingStyle === 'HEADING_4') { //mastery and minigame titles are of type 'HEADING_4'
            console.log(`\t\t\t${chaptersArray[k].text}`);

            //please see here for .test(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test

            if(graduationCapEmoji.test(chaptersArray[k].text)) { //Mastery
                masteryAndMinigamesData.push(createMastery(k));
            }

            if(cameraEmoji.test(chaptersArray[k].text)) { //Camera (Snapshot)
                masteryAndMinigamesData.push(createSnapshot(k));
            }

            if(notepadEmoji.test(chaptersArray[k].text)) { //Open Response (Image Boom)
                masteryAndMinigamesData.push(createImageBoom(k));
            }

            if(puzzlePieceEmoji.test(chaptersArray[k].text)) { //Sorting
                masteryAndMinigamesData.push(createSorting(k));
            }

            if(painterPaletteEmoji.test(chaptersArray[k].text)) { //Put in order (Reorder)
                masteryAndMinigamesData.push(createReorder(k));
            }

            if(booksEmoji.test(chaptersArray[k].text)) { //Quiz (QuizScreen)
                masteryAndMinigamesData.push(createQuiz(k)); 
            }

            if(brainEmoji.test(chaptersArray[k].text)) { //Memory
                masteryAndMinigamesData.push(createMemory(k)); 
            }
        }
        k++;
    }
    return masteryAndMinigamesData;
}

function createMastery(startIndex) {
    const masteryObject = {
        navigation: "Mastery",
        title: "common:mastery",
        prompt: "",
        content: []
    }
    let h = startIndex + 1;
    while(h < chaptersArray.length && !chaptersArray[h].headingStyle.includes("HEADING")) { //now iterating through mastery content

        if(chaptersArray[h+1]) { //falsy if array out of bounds
            if(chaptersArray[h+1].headingStyle.includes("HEADING")) {
                masteryObject.prompt = chaptersArray[h].text;
            } else {
                masteryObject.content.push({
                    text: chaptersArray[h].text,
                    image: "assets/cotton.png"
                })
            }
        } else { //edge case where we are at the end of the entire array and h+1 is out of bounds
            masteryObject.prompt = chaptersArray[h].text;
        }
        h++;
    }
    console.log(masteryObject);
    return masteryObject;
}

function createImageBoom(startIndex) {
    const imageBoomObject = {
        navigation: "Image Boom",
        backgroundColor: "palevioletred",
        title: "common:imageboom",
        icon: "assets/image.png",
        image: "assets/cotton.png",
        prompt: ""
    }

    let h = startIndex + 1;
    while(chaptersArray[h].headingStyle !== 'HEADING_4') { //iterating until next minigame
        imageBoomObject.prompt += chaptersArray[h].text + " ";
        h++;
    }
    console.log(imageBoomObject);
    return imageBoomObject;
}

function createSnapshot(startIndex) {
    const snapshotObject = {
        navigation: "Snapshot",
        title: "common:snapshot",
        icon: "assets/camera.png",
        backgroundColor: "#FFD972",
        prompt: ""
    }

    let h = startIndex + 1;
    while(chaptersArray[h].headingStyle !== 'HEADING_4') { //iterating until next minigame
        snapshotObject.prompt += chaptersArray[h].text + " ";
        h++;
    }
    console.log(snapshotObject);
    return snapshotObject;
}

//createSorting() logic relies on the fact that the chaptersArray's table attributes are ordered correctly, which is guaranteed if the table is formatted correctly in Google Docs.
function createSorting(startIndex) {
    const sortingObject = {
        navigation: "Sorting",
        title: "common:sorting",
        icon: "assets/recycle-bin.png",
        backgroundColor: "coral",
        prompt: "",
        categories: [],
        options: [] //name attribute is referring to the correct category that the title attribute is in
    }

    let h = startIndex + 1;
    let currentCategoryName = "";
    while(chaptersArray[h].headingStyle !== 'HEADING_4') { //iterating until next minigame
        if(chaptersArray[h].type === 'paragraph') {
            sortingObject.prompt += chaptersArray[h].text + " ";
        }

        if(chaptersArray[h].type.includes('top-table')) { //this is the category
            currentCategoryName = chaptersArray[h].text
            sortingObject.categories.push({ name: currentCategoryName, image: "assets/cotton.png" });
        }

        if(chaptersArray[h].type.includes('bottom-table')) { //these are the options
            sortingObject.options.push({ name: currentCategoryName, title: chaptersArray[h].text });
        }

        h++;
    }
    console.log(sortingObject);
    return sortingObject;
}

function createReorder(startIndex) {

    const reorderObject = {
        navigation: "Reorder",
        title: "common:reorder",
        icon: "assets/reorder.png",
        backgroundColor: "pink",
        prompt: "",
        content: []
    }

    let h = startIndex + 1;
    let count = 0;
    while(chaptersArray[h].headingStyle !== 'HEADING_4') { //iterating until next minigame
        if(count == 0) { //the first Reorder element within our referenceArray is always the prompt
            reorderObject.prompt += chaptersArray[h].text;
        } else {
            reorderObject.content.push({ text: chaptersArray[h].text });
        }
        count++;
        h++;
    }
    console.log(reorderObject);
    return reorderObject;
}

//createQuiz() logic relies on the fact that the questions within the quiz are formatted correctly within Google Docs
function createQuiz(startIndex) {
    const quizObject = {
        navigation: "Quiz",
        title: "common:quiz",
        icon: "assets/creativity.png",
        backgroundColor: "mediumpurple",
        content: [] //the array of questions
    }

    let h = startIndex + 1;
    let questionsCountIndex = -1;
    while(chaptersArray[h].headingStyle !== 'HEADING_4') {
        try {
            if(chaptersArray[h].textStyle.includes('bold')) { //on a question prompt, we push a new object to the content array
                quizObject.content.push({
                    prompt: chaptersArray[h].text,
                    answers: [],
                    answer: ""
                })
                questionsCountIndex++;
                //console.log(questionsCountIndex);
            } else if(chaptersArray[h].textStyle.includes('highlightedLightGreen')) { //this is the correct answer
                quizObject.content[questionsCountIndex].answers.push(chaptersArray[h].text); //pushing onto possible answers array
                quizObject.content[questionsCountIndex].answer = chaptersArray[h].text; //setting answer
            } else {(chaptersArray[h].textStyle === "") //other (incorrect) answers
                quizObject.content[questionsCountIndex].answers.push(chaptersArray[h].text);
            }

            h++;
        } catch(error) {
            console.log("most likely odd textStyle behaviour", error);
            break;
        }
    }
    console.log(quizObject);
    return quizObject;
}

function createMemory(startIndex) {
    const memoryObject = {
        navigation: "Memory",
        title: "common:memory",
        icon: "assets/willpower.png",
        backgroundColor: "dodgerblue",
        prompt: "",
        content: [] //the array of questions
    }

    let h = startIndex + 1;
    let count = 0;
    while(chaptersArray[h].headingStyle !== 'HEADING_4') {
        if(count == 0) { //first line will always be the prompt
            memoryObject.prompt = chaptersArray[h].text;
        } else { //we make two objects, one for the text, one for the image. See MemoryHandler for more info.
            memoryObject.content.push({ name: chaptersArray[h].text });
            memoryObject.content.push({ name: chaptersArray[h].text, image: "assets/cotton.png" })
        }
        count++;
        h++;
    }

    console.log(memoryObject);
    return memoryObject;
}

export { downloadBlob, parseDocument }