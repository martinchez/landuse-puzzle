import { errorService } from '../services/errorService';

export interface ImageClassificationError {
  imageName: string;
  userAttempt: string;
  correctAnswer: string;
  gameLevel?: number;
  userId?: string;
  additionalContext?: string;
}

export const logImageClassificationError = async (
  errorData: ImageClassificationError
) => {
  try {
    await errorService.logError(
      `Image classification failed: ${errorData.imageName}`,
      `User classified as "${errorData.userAttempt}", correct answer was "${errorData.correctAnswer}". ${errorData.additionalContext || ''}`,
      'error',
      null, // gameState
      {
        imageName: errorData.imageName,
        classificationAttempt: errorData.userAttempt,
        correctClassification: errorData.correctAnswer,
        errorType: 'image_classification',
        gameLevel: errorData.gameLevel,
        userId: errorData.userId
      }
    );
  } catch (error) {
    console.error('Failed to log image classification error:', error);
  }
};

export const logCorrectImageClassification = async (
  imageName: string,
  classification: string,
  gameLevel?: number,
  userId?: string
) => {
  try {
    await errorService.logError(
      `Image classification success: ${imageName}`,
      `Correctly classified as "${classification}"`,
      'info',
      null,
      {
        imageName,
        classificationAttempt: classification,
        correctClassification: classification,
        errorType: 'image_classification_success',
        gameLevel,
        userId
      }
    );
  } catch (error) {
    console.error('Failed to log image classification success:', error);
  }
};
