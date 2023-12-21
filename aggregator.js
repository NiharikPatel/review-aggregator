const https = require('https')
require('dotenv').config();
const fs = require('fs').promises;

const API_KEY = process.env.YELP_API_KEY;

// List of restraunts from yelp API
const restaurantNames = [
    'lillians-italian-kitchen-santa-cruz-2',
    'east-end-gastropub-capitola',
    'hulas-island-grill-santa-cruz-santa-cruz',
    'mariannes-ice-cream-santa-cruz',
    'laili-restaurant-santa-cruz',
    'the-water-street-grill-santa-cruz',
    'roux-dat-capitola-5',
    'mad-yolks-santa-cruz',
    'sugo-italian-pasta-bar-santa-cruz' 
  ]

// function to call api with restrauntaunt alias as params and get total reviews
function reviewsRequest(alias){
    const url = {
    hostname: 'api.yelp.com',
    path: `/v3/businesses/${alias}/reviews?sort_by=yelp_sort`,
    headers: { Authorization: `Bearer ${API_KEY}` }
    }
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
          let data = '';
    
          res.on('data', (chunk) => {
            data += chunk;
          });
    
          res.on('end', () => {
            const reviews = JSON.parse(data).reviews|| [];
            resolve(reviews);
          });
        });
    
        req.on('error', (error) => {
          reject(error);
        });
    
        req.end();
      });
    }

// function fetch each restraunts reviews and get average rating, reviewer name, rating and review text
 async function fetchReviews(){
    for(let alias of restaurantNames){
        try{
            let reviews = await reviewsRequest(alias);
            let output = formatOutput(alias, calculateAverageRating(reviews), reviews);
            output += '********************************************\n';
            const fileName = 'output.txt';
            console.log(output); 
            await saveToFile(output, fileName);
        }
        catch(error){
            console.error('Error fetching reviews for: ', alias, error.message);
        }
    }
   }

//    function to calculate average rating all the rating of individual review
   function calculateAverageRating(reviews)
   {
    let averageRating = 0;
    const totalRatings = reviews.reduce((sum, review)=>sum+review.rating, 0);
    if (reviews.length > 0) {
        averageRating = Math.round((totalRatings/reviews.length)* 10)/10;
    }
    return averageRating;
   }

// function to save data in text file 
function formatOutput(alias, averageRating, reviews) {
    let output = `Review for: ${alias}\n`;
    output += `Average Rating: ${averageRating}\n`;
    output += `Reviews Details: \n\n`;

  
    for (const review of reviews) {
      output += `Username: ${review.user.name}\n`;
      output += `Rating: ${review.rating}\n`;
      output += `Text: ${review.text}\n`;
      output += '-----------------------------\n';
    }
  
    return output;
  }

// function to append the data to text file
async function saveToFile(data, fileName) {
    try {
      // Use 'a' flag for append mode
      await fs.writeFile(fileName, data, { encoding: 'utf-8', flag: 'a' });
      
    } catch (error) {
      console.error(`Error appending to ${fileName}:`, error.message);
    }
  }
  
//    Calling main function for dsired output
 fetchReviews()