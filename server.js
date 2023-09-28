const express = require('express');
const bodyParser = require('body-parser');
const creatorRoutes = require('./routes/creatorRotes');


const app = express();
const port = process.env.PORT || 3000;



app.use(bodyParser.json());

// Include creator routes
app.use('/api', creatorRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
