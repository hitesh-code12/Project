# Google Maps API Setup Guide

## 🗺️ **Google Maps Places API Integration**

The expense management system now includes Google Maps Places API integration for venue selection. This allows admins to search for venues using Google's comprehensive database and automatically create venue entries.

## 🔧 **Setup Instructions:**

### **Step 1: Get Google Maps API Key**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable the following APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. **Create credentials**:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

### **Step 2: Configure API Key**

1. **Open the HTML file**: `mydrivecloud/public/index.html`
2. **Replace the placeholder**:
   ```html
   <!-- Replace YOUR_GOOGLE_MAPS_API_KEY with your actual API key -->
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places"></script>
   ```

### **Step 3: Set API Key Restrictions (Recommended)**

1. **Go back to Google Cloud Console**
2. **Click on your API key** to edit it
3. **Set application restrictions**:
   - Choose "HTTP referrers (web sites)"
   - Add your domain: `https://hitesh-code12.github.io/*`
4. **Set API restrictions**:
   - Choose "Restrict key"
   - Select only the APIs you enabled (Maps JavaScript API, Places API, Geocoding API)

## 🎯 **Features Available:**

### **Venue Search:**
- **Google Places Search**: Search for any venue worldwide
- **Autocomplete**: Real-time suggestions as you type
- **Location Data**: Automatic extraction of address, coordinates, and place details
- **Existing Venues**: Shows existing venues in your system
- **Auto-Creation**: Automatically creates new venue entries from Google Places

### **How It Works:**
1. **Admin searches** for a venue in the expense form
2. **Google Places API** provides real-time suggestions
3. **Admin selects** a venue from the results
4. **System checks** if venue already exists in database
5. **If new venue**: Automatically creates venue entry with Google data
6. **If existing venue**: Uses the existing venue
7. **Expense is created** with the selected venue

## 🔒 **Security Features:**

- **API Key Restrictions**: Domain and API restrictions
- **Input Validation**: All venue data is validated
- **Duplicate Prevention**: Checks for existing venues before creating new ones
- **Admin Only**: Only admin users can create venues

## 📋 **Venue Data Extracted:**

When a venue is selected from Google Places, the system automatically extracts:

```javascript
{
  name: "Venue Name",
  googlePlaceId: "unique_google_place_id",
  address: {
    street: "Full formatted address",
    city: "City name",
    state: "State name", 
    zipCode: "Postal code",
    country: "India"
  },
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  description: "Venue imported from Google Places",
  contactInfo: {
    phone: "Not provided",
    email: "Not provided"
  },
  facilities: ["parking", "lighting"],
  courts: [{
    number: 1,
    type: "indoor",
    surface: "synthetic",
    isActive: true
  }],
  pricing: {
    hourlyRate: 500,
    currency: "INR"
  }
}
```

## 🚀 **Usage Instructions:**

### **For Admins:**
1. **Go to Payments Management**
2. **Click "Add Expense"**
3. **In the Venue field**: Start typing a venue name
4. **Select from suggestions**: Choose from Google Places or existing venues
5. **Fill other details**: Date, amount, description, category
6. **Submit**: The expense will be created with the selected venue

### **Benefits:**
- **Accurate Data**: Uses Google's verified venue information
- **Time Saving**: No need to manually enter venue details
- **Consistency**: Standardized venue data across the system
- **Global Coverage**: Access to venues worldwide

## ⚠️ **Important Notes:**

1. **API Key Required**: The system won't work without a valid Google Maps API key
2. **Usage Limits**: Google Maps API has usage limits and costs
3. **Internet Required**: Requires internet connection for venue search
4. **Fallback**: If Google Maps is unavailable, you can still manually select existing venues

## 🔧 **Troubleshooting:**

### **If venue search doesn't work:**
1. Check if API key is correctly set in `index.html`
2. Verify API key restrictions allow your domain
3. Check browser console for JavaScript errors
4. Ensure all required APIs are enabled in Google Cloud Console

### **If venue creation fails:**
1. Check backend logs for errors
2. Verify MongoDB connection
3. Check if venue with same Google Place ID already exists

## 💰 **Cost Considerations:**

- **Google Maps API**: Has usage-based pricing
- **Free Tier**: $200 monthly credit (usually sufficient for small to medium usage)
- **Monitoring**: Set up billing alerts in Google Cloud Console
- **Optimization**: The system caches venue data to reduce API calls

## 🎉 **Ready to Use!**

Once you've set up the Google Maps API key, the venue search feature will be fully functional in the expense management system! 