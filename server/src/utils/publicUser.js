const serializeAddress = (address) => ({
  id: address._id?.toString() || address.id?.toString() || "",
  label: address.label || "",
  addressLine1: address.addressLine1 || "",
  addressLine2: address.addressLine2 || "",
  city: address.city || "",
  state: address.state || "",
  postalCode: address.postalCode || "",
  country: address.country || "",
  isDefault: Boolean(address.isDefault),
});

const toPublicUser = (user) => ({
  id: user._id?.toString() || user.id?.toString() || "",
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  addresses: Array.isArray(user.addresses)
    ? user.addresses.map(serializeAddress)
    : [],
});

module.exports = toPublicUser;
