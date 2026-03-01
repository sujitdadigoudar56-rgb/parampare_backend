import Address, { IAddress } from './address.model';

export class UserService {
  // Address Methods
  async getAddresses(userId: string): Promise<IAddress[]> {
    return await Address.find({ userId });
  }

  async addAddress(userId: string, data: Partial<IAddress>): Promise<IAddress> {
    // If set as default, unset others 
    if (data.isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
    }
    return await Address.create({ ...data, userId });
  }

  async updateAddress(userId: string, addressId: string, data: Partial<IAddress>): Promise<IAddress | null> {
    if (data.isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
    }
    return await Address.findOneAndUpdate({ _id: addressId, userId }, data, { new: true });
  }

  async deleteAddress(userId: string, addressId: string): Promise<IAddress | null> {
    return await Address.findOneAndDelete({ _id: addressId, userId });
  }
}

export const userService = new UserService();
