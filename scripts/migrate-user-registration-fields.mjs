import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
}

const userSchema = new mongoose.Schema({}, { strict: false, collection: "users" });
const User = mongoose.models.UserMigration || mongoose.model("UserMigration", userSchema);

await mongoose.connect(MONGODB_URI);

const users = await User.find({});
let updatedCount = 0;

for (const user of users) {
    const phoneNumber = user.phoneNumber || user.phone || "";
    const street = user.street || user.addressStreet || "";
    const city = user.city || user.addressCity || "";
    const country = user.country || user.addressCountry || "";
    const postCode = user.postCode || user.addressPostalCode || "";
    const dateOfBirth = user.dateOfBirth || user.birthDate || null;
    const name =
        user.name ||
        [user.firstName || "", user.lastName || ""].filter(Boolean).join(" ").trim();

    const nextValues = {
        phoneNumber,
        phone: phoneNumber,
        street,
        addressStreet: street,
        city,
        addressCity: city,
        country,
        addressCountry: country,
        postCode,
        addressPostalCode: postCode,
        dateOfBirth,
        birthDate: dateOfBirth,
        name,
    };

    const shouldUpdate = Object.entries(nextValues).some(([key, value]) => {
        const currentValue = user[key];
        return String(currentValue ?? "") !== String(value ?? "");
    });

    if (!shouldUpdate) continue;

    Object.assign(user, nextValues);
    await user.save();
    updatedCount += 1;
}

console.log(`Updated ${updatedCount} user records`);

await mongoose.disconnect();
