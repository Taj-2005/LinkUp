"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post('/signin', authController_1.signin);
router.post('/signup', authController_1.signup);
router.post('/refresh', authController_1.refreshTokenHandler);
router.post('/signout', authController_1.signout);
exports.default = router;
