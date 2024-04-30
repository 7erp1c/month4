import {
    ApiRequestModel,
    BlogModel, CommentsModel,
    PostModel,
    RefreshTokenModel,
    SecurityModel,
    UserModel
} from "../../db/mongoose/models";



export const clearDatabase = async () => {
    try {
        //
         //const models = [UserModel, BlogModel, PostModel,SecurityModel,ApiRequestModel,RefreshTokenModel,CommentsModel];
        await Promise.all([
            UserModel.deleteMany({}),
            BlogModel.deleteMany({}),
            PostModel.deleteMany({}),
            SecurityModel.deleteMany({}),
            ApiRequestModel.deleteMany({}),
            RefreshTokenModel.deleteMany({}),
            CommentsModel.deleteMany({}),
        ]) ;


        // Проходим по каждой модели и удаляем все документы
         //await Promise.all(models.map(model => model.deleteMany({} as FilterQuery<model.>)));

        console.log('All collections cleared successfully');
    } catch (error) {
        console.error('Error clearing collections:', error);
    }
};