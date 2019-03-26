/**
 * Rss20Min take 20min.ch rss feed and put the data into array
 *
 * @author: Dardan
 * @param node
 * @constructor
 */
function Rss20Min(){
    let baseLink = function(){
        return "https://api.20min.ch/rss/ro/view/";
    };

    this.getRssLink = function(feedName){
        let viewId = 0;
        /**
         * Feeds rss that are present on https://www.20min.ch/ro/share/
         */
        switch(feedName.toLowerCase()){
            case "accueil":
                viewId = 59;
                break;
            case "actualites":
                viewId = 137;
                break;
            case "suisse":
                viewId = 470;
                break;
            case "monde":
                viewId = 472;
                break;
            case "economie":
                viewId = 165;
                break;
            case "faits divers":
                viewId = 474;
                break;
            case "vaud":
                viewId = 464;
                break;
            case "geneve":
                viewId = 466;
                break;
            case "romandie":
                viewId = 468;
                break;
            case "people":
                viewId = 147;
                break;
            case "sport":
                viewId = 149;
                break;
            case "hi-tech":
                viewId = 143;
                break;

        }

        return baseLink() + viewId;
    };

    let feedXmlData = function(feedLink){
        let xhr = new XMLHttpRequest();
        xhr.open("GET", feedLink, false); // To make it asynchronous, the third parameter should be true. Here we want it to be synchronous so we put false
        xhr.overrideMimeType("text/xml");
        xhr.send();

        return xhr.responseXML;
    };

    this.getFeedFor = function(feed){
        let linkToFeed = this.getRssLink(feed);
        let xmlData = feedXmlData(linkToFeed);
        console.log(xmlData);
        let xmlNode = new XmlNode(xmlData);
        return xmlNode.subNode("rss").subNode("channel").actualNode;
    };
}

/**
 * The code below is not at all obligatory for the main aim of the project but helps to access more easily xml nodes.
 * Aim: Access more easily sub-nodes of xml without having to carry if they are direct child or only available into the "children" node or access it by tag.
 * Specifically created for RIA
 *
 * @author: Dardan
 * @param node
 * @constructor
 */
function XmlNode (node, parent) {
    this.actualNode = node;
    this.parent     = (typeof parent != "undefined") ? parent : null;

    /**
     * Search into subNode to find what we want
     * @param node
     * @returns {XmlNode}
     */
    this.subNode = function(node){

        // If we can access this node directly we send it back
        if(typeof this.actualNode[node] != "undefined"){
            return new XmlNode(this.actualNode[node], this);
        }
        else{ // Node not found, going to search deeper with searchForTag
            let result;
            if( (result = this.searchForTag(node)) )
                return result;
            else
                console.log("Impossible to find the node '" + node + "' (the parent doesn't contain this child)");
        }
    };

    /**
     * Go to the parent node
     * @returns {XmlNode}
     */
    this.upNode = function(){
        if(this.parent != null)
            return this.parent;

        console.log("Parent of the actual node doesn't exist");
        return this;
    };

    /**
     * Search a tag into a the actualNode list.
     * If the node is accessible directly, it will return it.
     * If not it will search for HTMLCollection object and do a loop in it to see if the tag we search is present.
     * @param tagName
     * @returns {XmlNode}
     */
    this.searchForTag = function(tagName){

        // If the child is directly accessible, we return it
        if(typeof this.actualNode[tagName] != "undefined"){
            console.log("searchForTag '" + tagName + "' is present as a child directly");
            return new XmlNode(this.actualNode[tagName], this);
        }

        // If the actual node is already a HTMLCollection, we directly search into it
        if(this.actualNode.constructor.name === "HTMLCollection") {
            // We transform HTMLCollection into an array to make things easier to process
            let htmlCollectionArray = Array.from(this.actualNode);

            for(let subNode in htmlCollectionArray){
                // If what we search is present into this collection we return this one
                if(htmlCollectionArray[subNode].nodeName === tagName)
                    return new XmlNode(this.actualNode[subNode], this);

            }
        }else{ // The node is not a HTMLCollection, we need to search a HTMLCollection object into the node.

            for (let tag in this.actualNode) {

                if(this.actualNode[tag] != null && typeof this.actualNode[tag] != "undefined"){

                    if (this.actualNode[tag].constructor.name === "HTMLCollection") {
                        let newNode = new XmlNode(this.actualNode[tag], this);
                        let searchNode = newNode.searchForTag(tagName);

                        // If the object are not the same, it means that we found the tag we wanted to search (tagName) and this thing is in searchNode
                        if(newNode !== searchNode)
                            return searchNode;

                    }
                }
            }
        }

        return this;
    };

    /**
     * @param subNode
     * @returns {any[]}
     */
    // this.toArray = function(){
    //     let array = [];
    //     if(this.actualNode.constructor.name === "HTMLCollection") {
    //         return Array.from(this.actualNode).flat(1000);
    //     }
    //
    //     // We try to find if "children" exists (
    //     if(typeof this.actualNode["children"] != "undefined") {
    //
    //         for(let node in this.actualNode["children"]){
    //             console.log(this.actualNode["children"][node] + " type: " + this.actualNode["children"][node].constructor.name);
    //
    //         }
    //         // return Array.from(this.actualNode["children"]).flat(1000);
    //     }else {
    //         console.log("Couldn't find children or htmlcollection so a try to put the last node as an array is returned");
    //         return Array.from(this.actualNode).flat(1000);
    //     }
    // };
}
