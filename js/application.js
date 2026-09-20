if (
    "serviceWorker" in navigator &&
    (window.location.protocol === "http:" || window.location.protocol === "https:")
) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}

const wordCountDefault = 15;

const settings = {
    displayTime: 700,
    worddivider: false,
    highlightvocals: false,
    vowelColor: "#DC143C",
    fontsize: "48pt",
    randomWords: false,
    wordCounter: false,
    wordCountDefault: wordCountDefault,
    wordlist: ["Ki-no", "Da-me", "Lo-ma", "Au-to", "Ro-ni", "Ki-le", "Ra-te", "Au-bi", "Pa-pa", "Bi-no", "Ju-te", "Lu-pe", "Fa-ra", "Na-se"]
}

var overlay;
var settingsPopup;
var wordcountFinishedPopup;
var openSettingsToggle;
var closeSettingsToggle;
var loadWordlistLink;
//Word controls
var previousWordButton;
var showWordButton;
var nextWordButton;
var randomWordButton;

var shownWords = new Map();

// Wait for the page to load first
window.onload = function() {
    //Initialize variables
    overlay = document.getElementById("overlay");
    settingsPopup = document.getElementById("settingsPopup");
    wordcountFinishedPopup = document.getElementById("wordcountFinishedPopup");
    openSettingsToggle = document.getElementById("settingsToogle");
    closeSettingsToggle = document.getElementById("closeSettingsToggle");
    loadWordlistLink = document.getElementById("loadWordlist");
    previousWordButton = document.getElementById("previousWordButton");
    showWordButton = document.getElementById("showWordButton");
    nextWordButton = document.getElementById("nextWordButton");
    randomWordButton = document.getElementById("randomWordButton");

    //Set settings values
    document.getElementById("timevisible").value = settings.displayTime;
    document.getElementById("fontsize").value = settings.fontsize;
    document.getElementById("wordView").style.fontSize = settings.fontsize;
    document.getElementById("vowelColor").value = settings.vowelColor;
    document.getElementById("randomWords").value = settings.randomWords;
    document.getElementById("wordCount").value = settings.wordCountDefault;
    document.getElementById("randomWordButton").style.display = "none";
    settings.wordlist.forEach(word => { document.getElementById("wordlist").value += word + "\n"; });

    //Set event handlers
    previousWordButton.onclick = function() {
        wordlistRenderer.toggleDisplayPreviousWord("pseudoWordDisplay", settings);
        return false;
    }
    showWordButton.onclick = function() {
        wordlistRenderer.toggleDisplayWord("pseudoWordDisplay", settings);
        return false;
    }
    nextWordButton.onclick = function() {
        wordlistRenderer.toggleDisplayNextWord("pseudoWordDisplay", settings);
        return false;
    }
    randomWordButton.onclick = function() {
        wordlistRenderer.toggleDisplayRandomWord("pseudoWordDisplay", settings);
        return false;
    }
    openSettingsToggle.onclick = function() {
        overlay.style.display = 'block';
        settingsPopup.style.display = 'block';
    }
    closeSettingsToggle.onclick = function() {
        overlay.style.display = 'none';
        settingsPopup.style.display = 'none';
        wordlist = document.getElementById("wordlist").value.split("\n");
        settings.wordlist = wordlist;
    }
    document.getElementById('wordlistFileInput').addEventListener('change', loadWordlist, false);  
    document.getElementById("overlay").onclick = function() {
        overlay.style.display = 'none';
        settingsPopup.style.display = 'none';
        wordcountFinishedPopup.style.display = 'none';
        wordlist = document.getElementById("wordlist").value.split("\n");
        settings.wordlist = wordlist;
        wordlistRenderer.wordlistPointer = -1;
    }

    document.getElementById('backgroundcolor').onchange = function() {
        document.body.style.backgroundColor = document.getElementById('backgroundcolor').value;
        return false;
    }
    document.getElementById('textcolor').onchange = function() {
        document.getElementById('wordView').style.color = document.getElementById('textcolor').value;
        return false;
    }
    document.getElementById('vowelColor').onchange = function() {
        settings.vowelColor = document.getElementById('vowelColor').value;
        return false;
    }
    document.getElementById('worddivider').onchange = function() {
        settings.worddivider = document.getElementById('worddivider').checked;
        return false;
    }
    document.getElementById('highlightvocals').onchange = function() {
        settings.highlightvocals = document.getElementById('highlightvocals').checked;
        return false;
    }
    document.getElementById('randomWords').onchange = function() {
        settings.randomWords = document.getElementById('randomWords').checked;
        if (settings.randomWords == true) {
            document.getElementById("randomWordButton").style.display = "";
            document.getElementById("previousWordButton").style.display = "none";
            document.getElementById("nextWordButton").style.display = "none";
        } else {
            document.getElementById("randomWordButton").style.display = "none";
            document.getElementById("previousWordButton").style.display = "";
            document.getElementById("nextWordButton").style.display = "";
        }
        return false;
    }
    document.getElementById('timevisible').onchange = function() {
        settings.displayTime = document.getElementById('timevisible').value;
        return false;
    }
    document.getElementById('wordCounterOff').onclick = function() {
        settings.wordCounter = false;
        resetShownWordsMap();
        return true;
    }
    document.getElementById('wordCounterOn').onclick = function() {
        settings.wordCounter = true;
        resetShownWordsMap();
        return true;
    }
    document.getElementById('wordCount').onchange = function() {
        settings.wordCountDefault = document.getElementById('wordCount').value;
        resetShownWordsMap();
        return false;
    }
    document.getElementById('fontsize').onchange = function() {
        document.getElementById('wordView').style.fontSize = document.getElementById('fontsize').value;
        settings.fontsize = document.getElementById('fontsize').value;
        return false;
    }
};

function loadWordlist(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
        reader.onload = function(e) {
        var contents = e.target.result;
        document.getElementById("wordlist").value = contents;
    };
    reader.readAsText(file);
    resetShownWordsMap();
    wordlistRenderer.wordlistPointer = -1;
}

function resetShownWordsMap() {
    shownWords = new Map();
}

function showWordcountFinishedPopup() {
    settingsPopup.style.display = 'none';
    overlay.style.display = 'block';
    wordcountFinishedPopup.style.display = 'block';
}

const wordlistRenderer = {
    wordlistPointer: -1,

    toggleDisplayWord(displayId, settings) {
        wordDisplayElement = document.getElementById(displayId);
        
        if(wordDisplayElement.style.display == "") {
            if(this.wordlistPointer == -1) {
                this.wordlistPointer++;
            }
            currentWord = settings.wordlist[this.wordlistPointer]
            if(settings.worddivider === false) {
                currentWord = currentWord.replaceAll("-", "");
            }
            if(settings.highlightvocals) {
                vowels = ["a","ä","e","i","o","ö","u","ü"];
                wordWithHighlightedVowels = "";
                
                for (let char of currentWord) {
                    var escapedVowel = "";
                    vowels.forEach(vowel => {
                        if(vowel === char.toLowerCase()) {
                            escapedVowel = "<span style='color:"+ settings.vowelColor + "'>"+ char +"</span>";
                        }
                    });
                    if(escapedVowel != "") {
                        wordWithHighlightedVowels += escapedVowel;
                    } else {
                        wordWithHighlightedVowels += char;
                    }
                }
                currentWord = wordWithHighlightedVowels;
            }
            wordDisplayElement.style.display = "block";
            wordDisplayElement.innerHTML = currentWord;

            setTimeout(function() { wordlistRenderer.toggleDisplayWord("pseudoWordDisplay", settings); }, settings.displayTime);
        } else {
            wordDisplayElement.style.display = "";
            wordDisplayElement.innerHTML = "";

            if(settings.wordCounter == true) {
                shownWords.set(settings.wordlist[this.wordlistPointer], settings.wordlist[this.wordlistPointer]);

                if(shownWords.size == settings.wordCountDefault) {
                    showWordcountFinishedPopup();
                    resetShownWordsMap();
                }
            }
        }
    },

    toggleDisplayNextWord(displayId, settings) {
        if ((this.wordlistPointer + 1) < settings.wordlist.length) {
            this.wordlistPointer++;
        }
        this.toggleDisplayWord(displayId, settings);
    },

    toggleDisplayPreviousWord(displayId, settings) {
        if ((this.wordlistPointer - 1) != -1) {
            this.wordlistPointer--;
        }
        this.toggleDisplayWord(displayId, settings);
    },

    toggleDisplayRandomWord(displayId, settings) {
        this.wordlistPointer = Math.floor(Math.random() * settings.wordlist.length);
        this.toggleDisplayWord(displayId, settings);
    }
};

