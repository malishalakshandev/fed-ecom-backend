
import { Request, Response, NextFunction } from "express";
import { CreateColorDTO } from "../domain/dto/color";
import Color from "../infrastructure/db/entities/Color";
import ValidationError from "../domain/errors/validation-error";
import AlreadyExistError from "../domain/errors/already-exist-error";


const createColor = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const result = CreateColorDTO.safeParse(req.body);

        if (!result.success) {
            throw new ValidationError(result.error.message);
        }

        const existingColor = await Color.findOne(
            {colorName: result.data.colorName},
            null,
            { collation: { locale: "en", strength: 2 } } // options
        )

        if(existingColor){
            throw new AlreadyExistError("Colour already exist");
        }

        await Color.create(result.data);
        res.status(201).send({ message: "Colour created successfully" });

    } catch (error) {
        next(error);
    }

};

const getAllColors = async (req: Request, res: Response, next: NextFunction) => {

    try {
        
        const colors = await Color.find({}).sort({ createdAt: 1 });
        res.status(200).json(colors);

    } catch (error) {
        next(error)
    }
}

export {
    createColor,
    getAllColors
};