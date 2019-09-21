// # ============================================================== ¤ when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {

    // set focus to input text 
    // document.getElementById('keyword').value = "dépoussiérer"; //●
    document.getElementById('keyword').focus()

    document.body.addEventListener('keydown', function (e) {
        // if (e.altKey || e.ctrlKey || e.shiftKey) {
        if (e.key == "Enter") {
            chercher();
        }
    });


    // # ------------------------------------------------------ ¤¤ get selected text on page
    // https://stackoverflow.com/questions/19164474/chrome-extension-get-selected-text
    // https://stackoverflow.com/questions/4996194/chrome-tabs-executescript-not-working?answertab=active#tab-top
    chrome.tabs.executeScript({
        code: "window.getSelection().toString();"
    }, function (selection) {

        //if there is a selected text, start the translate, otherwise wait for text in input
        if (!(typeof selection === 'undefined' || selection === null)) {
            document.getElementById('keyword').value = selection
            chercher();
        }
    });

    // # ------------------------------------------------------ ¤¤ add function to button translate
    var buttonchercher = document.getElementById('buttonchercher');
    buttonchercher.addEventListener('click', function () {
        chercher();
    }, false);


}, false); // # ============================================================== ¤ end DOM loaded (document.addEventListener('DOMContentLoaded') )



// # ------------------------------------------------------ ¤¤  chercher (called by button/enter)
function chercher() {
    // remove the text of  the div that indicate which 

    var keyword = document.getElementById('keyword').value;
    // alert(keyword);
    // if source text isn't empty
    if (!(keyword == "")) {
        // #......................................¤¤¤ ★ google API
        // https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=fr&dt=t&q=father
        var urls = [
            ["https://www.cnrtl.fr/morphologie/" + keyword, "vtoolbar", "morf_sound"], //best for plural
            // ["https://www.cnrtl.fr/etymologie/" + keyword, "vitemselected"],
            ["https://www.cnrtl.fr/synonymie/" + keyword, "syno_format"],
            // ["https://crisco2.unicaen.fr/des/synonymes/" + keyword, "synonymes"] //https://crisco2.unicaen.fr/des/synonymes/dépoussiérer  - difficult to retrieve because no id

        ]
        // test with hibou,  tribal, aller,lancer

        var resultdiv = document.getElementById("result")
        resultdiv.innerText = "requete en cours";
        var results = [];
        var errors = [];

        urls.forEach((item, index) => {

            // alert(url1)


            var http1 = new XMLHttpRequest();
            // when readyState change this function is called 
            // readyState = 0 = UNSENT  / 1	OPENED	/ 2	HEADERS_RECEIVED / 3	LOADING	/ 4	DONE

            http1.onreadystatechange = function () {
                if (http1.readyState == 4 && http1.status == 200) {
                    parser = new DOMParser();
                    var ulr1response = parser.parseFromString(http1.responseText, "text/html");
                    if (index == 0) {
                        // if url = etymologie  
                        // var form = ulr1response.getElementById(item[1]).innerText
                        // results.push([form]);

                        // if url = morphologie  
                        var form = ulr1response.getElementById(item[1]).getElementsByTagName("li")
                        var allresult = [];
                        for (i = 0; i < form.length; i++) {
                            if (!form[i].innerText.includes("verbe")) {
                                var response = ulr1response.getElementsByClassName(item[2])
                                for (i = 0; i < response.length; i++) {
                                    allresult.push(response[i].innerText)
                                }
                            } else {
                                allresult.push(form[i].innerText)
                            }
                        }

                        results.push(allresult);



                    } else if (index == 1) {
                        var response = ulr1response.getElementsByClassName(item[1]);
                        var allresult = [];
                        for (i = 0; i < response.length; i++) {
                            allresult.push(response[i].innerText)
                        }
                        // alert(allresult)
                        results.push(allresult);
                    }
                    if (results[1] == "") {
                        resultdiv.innerHTML = results[0].join(", ") + "</br></br>Pas de synonymes trouvés"
                    } else {
                        resultdiv.innerHTML = "<b>" + results[0].join(", ") + "</br></br>Synonymes:</b></br>● " + results[1].join('</br>● ')
                    }
                    // resultdiv.innerText = results[0] + "\n\nSynonymes:\n● " + results[1].join('\n● ')

                    // https://www.cnrtl.fr/morphologie/tribal
                    // results[1].join is not a function at XMLHttpRequest.http1.onreadystatechange
                    // Cannot read property 'join' of undefined at XMLHttpRequest.http1.onreadystatechange

                } else {
                    errors.push(index);
                    resultdiv.innerText = "Erreur: " + index + " " + http1.readyState + "  " + http1.status;

                }
            }
            http1.open("GET", item[0], false);
            http1.send(null); // null = no parameters



        });


    }
};