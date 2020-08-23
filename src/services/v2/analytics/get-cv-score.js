import axios from "axios"
import ScoreService from '../score'
const getCvUrl = "/somthing to make" // todo: complete this

export default function getCvScore(cvId = null) {
  if(!cvId){
     throw new Error("Id of CV is needed!")
  }
  const { data } = axios.post(getCvUrl, { cvId });
  for (let dicctionaryId of data){
    ScoreService.create({
      cvId,
      dicctionaryId,
      score: data[dicctionaryId] // this will be a ObjectId
    })
  }
}
