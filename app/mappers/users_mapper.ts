import User from '#models/user'

export default class UsersMapper {
  public static toPublicUserData(user: User) {
    const userData = user.toJSON()
    return {
      id: userData.id,
      username: userData.username,
      firstname: userData.firstname,
      lastname: userData.lastname,
      profilePictureUrl: userData.profilePictureUrl,
      createdAt: userData.createdAt,
    }
  }

  public static toDetailedUserData(user: User) {
    const userData = user.toJSON()
    return {
      id: userData.id,
      username: userData.username,
      firstname: userData.firstname,
      lastname: userData.lastname,
      profilePictureUrl: userData.profilePictureUrl,
      description: userData.description,
      createdAt: userData.createdAt,
    }
  }
}
