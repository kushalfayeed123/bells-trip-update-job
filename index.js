// Import necessary libraries if using a Node.js environment
import fetch from "node-fetch";
import express from "express";

const app = express();
const port = 3000;

const TRIPS_API = "https://bells-transport-web-service.vercel.app/api/trips";
const UPDATE_TRIP_API = "https://bells-transport-web-service.vercel.app/api/trip";

async function updateTripsStatus() {
  try {
    // Step 1: Fetch all trips
    const response = await fetch(TRIPS_API);

    if (!response.ok) {
      throw new Error(`Failed to fetch trips: ${response.statusText}`);
    }

    const trips = await response.json();
    const now = new Date();

    // Step 2: Filter trips with departureDate before today
    const tripsToUpdate = trips.filter(trip => {
      const departureDate = new Date(trip.departureDate);
      const timeDifference = now - departureDate; // Time difference in milliseconds
      return timeDifference >= 12 * 60 * 60 * 1000 && departureDate < now; // 24 hours in milliseconds
    });

    const filteredTrips = tripsToUpdate.filter(trip => {
      return trip.status == 'Active'
    })

    // Step 3: Update each trip's status to "Completed"
    console.log(tripsToUpdate.length)
    for (const trip of filteredTrips) {
      const updatedTrip = {
        id: trip.id,
        departureTerminalId: trip.departureTerminal?.id || "",
        destinationTerminalId: trip.destinationTerminal?.id || "",
        vehicleId: trip.vehicle?.id || "",
        passengers: trip.passengers || [],
        status: "Completed",
        feePerPassenger: trip.feePerPassenger || "",
        departureDate: trip.departureDate,
        arrivalDate: trip.arrivalDate,
        createdDate: trip.createdDate,
        modifiedDate: new Date().toISOString(), // ISO format for current date
        createdBy: trip.createdBy || "",
        modifiedBy: "System", // Assuming system is modifying
        tripNumber: trip.tripNumber || "",
      };

      const updateResponse = await fetch(`${UPDATE_TRIP_API}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTrip),
      });

      if (!updateResponse.ok) {
        console.error(`Failed to update trip ${trip.id}: ${updateResponse.statusText}`);
      } else {
        console.log(`Successfully updated trip ${trip.id}`);
      }
    }
  } catch (error) {
    console.error("Error updating trips:", error);
  }
}

// Define an endpoint to trigger the script
app.get("/update-trips", async (req, res) => {
  try {
    await updateTripsStatus();
    res.status(200).send("Trips updated successfully.");
  } catch (error) {
    res.status(500).send(`Error updating trips: ${error.message}`);
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
