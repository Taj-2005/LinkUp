import express from "express";
import { signin, signup, signout, refreshTokenHandler} from "../controllers/authController"
const router = express.Router()

router.post('/signin', signin)
router.post('/signup', signup)
router.post('/refresh', refreshTokenHandler)
router.post('/signout', signout)

export default router