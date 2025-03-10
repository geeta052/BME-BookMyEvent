const stopwords = new Set(["is", "a", "the", "this", "and", "to", "of", "in", "on", "for", "with"]);

const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") 
    .split(/\s+/)
    .filter(word => word && !stopwords.has(word)); 
};

const computeTF = (docTokens) => {
  let tf = {};
  docTokens.forEach(word => {
    tf[word] = (tf[word] || 0) + 1;
  });
  const docLength = docTokens.length;
  Object.keys(tf).forEach(word => {
    tf[word] /= docLength;
  });
  return tf;
};

const computeIDF = (documents) => {
  let idf = {};
  let totalDocs = documents.length;

  documents.forEach(docTokens => {
    let uniqueWords = new Set(docTokens);
    uniqueWords.forEach(word => {
      idf[word] = (idf[word] || 0) + 1;
    });
  });

  Object.keys(idf).forEach(word => {
    idf[word] = Math.log10(totalDocs / idf[word]);
  });

  return idf;
};

const computeTFIDF = (documents) => {
  let tokenizedDocs = documents.map(doc => tokenize(doc));
  let idf = computeIDF(tokenizedDocs);

  return tokenizedDocs.map(docTokens => {
    let tf = computeTF(docTokens);
    let tfidf = {};
    Object.keys(tf).forEach(word => {
      tfidf[word] = tf[word] * idf[word]; 
    });
    return tfidf;
  });
};

const calculateSimilarity = (userPrefs, pastEvents, events) => {
  const allDocs = [...events.map(event => event.description), userPrefs.join(" ")];
  const tfidfVectors = computeTFIDF(allDocs);
  
  const userVector = tfidfVectors.pop();
  
  const scores = events.map((event, index) => {
    const eventVector = tfidfVectors[index];
    let score = 0;

    Object.keys(userVector).forEach(word => {
      if (eventVector[word]) {
        score += userVector[word] * eventVector[word];
      }
    });

    return { event, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.map(s => s.event);
};

module.exports = { calculateSimilarity };
