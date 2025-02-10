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
      return trip.status == 'Booking'
    })

    // Step 3: Update each trip's status to "Completed"
    console.log(filteredTrips.length)
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

async function markTripsWithinDateRangeAsDeleted() {
  try {
    // Step 1: Fetch all trips
    const response = await fetch(TRIPS_API);

    if (!response.ok) {
      throw new Error(`Failed to fetch trips: ${response.statusText}`);
    }

    const trips = await response.json();

    // Step 2: Define date range
    const startDate = new Date("2025-01-14");
    const endDate = new Date("2025-01-26");

    // Step 3: Filter trips with departureDate within the date range
    const tripsWithinRange = trips.filter(trip => {
      const departureDate = new Date(trip.departureDate);
      return !isNaN(departureDate) && departureDate >= startDate && departureDate <= endDate;
    });

    console.log(`Found ${tripsWithinRange.length} trips within the date range.`);

    // Step 4: Update each trip's status to "Deleted"
    for (const trip of tripsWithinRange) {
     const updatedTrip = {
        id: trip.id,
        departureTerminalId: trip.departureTerminal?.id || "",
        destinationTerminalId: trip.destinationTerminal?.id || "",
        vehicleId: trip.vehicle?.id || "",
        passengers: trip.passengers || [],
        status: "Cancelled",
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
        console.log(`Successfully updated trip ${trip.id} to status "Deleted".`);
      }
    }
  } catch (error) {
    console.error("Error updating trips:", error);
  }
}


// async function markInvalidTripsAsDeleted() {
//   try {
//     // Step 1: Fetch all trips
//     const response = await fetch(TRIPS_API);

//     if (!response.ok) {
//       throw new Error(`Failed to fetch trips: ${response.statusText}`);
//     }

//     const trips = await response.json();

//     // Step 2: Filter trips where departureDate contains "Invalid Date"
//     const invalidTrips = trips.filter(trip =>
//       trip.departureDate.toLowerCase().includes("invalid date")
//     );

//     console.log(`Found ${invalidTrips.length} trips with invalid departure dates.`);

//     // Step 3: Update each trip's status to "Deleted"
//     for (const trip of invalidTrips) {
//       const updatedTrip = {
//         ...trip, // Keep other trip properties unchanged
//         status: "Deleted",
//         modifiedDate: new Date().toISOString(), // ISO format for current date
//         modifiedBy: "System", // Assuming system is modifying
//       };

//       const updateResponse = await fetch(`${UPDATE_TRIP_API}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(updatedTrip),
//       });

//       if (!updateResponse.ok) {
//         console.error(`Failed to update trip ${trip.id}: ${updateResponse.statusText}`);
//       } else {
//         console.log(`Successfully updated trip ${trip.id} to status "Deleted".`);
//       }
//     }
//   } catch (error) {
//     console.error("Error updating trips:", error);
//   }
// }


// Define an endpoint to trigger the script
app.get("/update-trips", async (req, res) => {
  try {
    await updateTripsStatus();
    res.status(200).send("Trips updated successfully.");
  } catch (error) {
    res.status(500).send(`Error updating trips: ${error.message}`);
  }
});

app.get("/delete-trips", async (req, res) => {
  try {
    await markTripsWithinDateRangeAsDeleted();
    res.status(200).send("Trips deleted successfully.");
  } catch (error) {
    res.status(500).send(`Error deleting trips: ${error.message}`);
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
