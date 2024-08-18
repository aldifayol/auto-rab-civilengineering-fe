import exphbs from 'express-handlebars';
import path from 'path';

// Configure Handlebars
const hbs = exphbs.create({
    extname: '.hbs', // File extension for Handlebars templates
    defaultLayout: false, // Disable default layouts
    layoutsDir: path.join(__dirname, '../views/layouts'), // Directory for layout files
    partialsDir: path.join(__dirname, '../views/partials'), // Directory for partial files
});


// Export the handlebars instance for compiling templates
export const handlebarsInstance = hbs.handlebars;