import Cookies from "js-cookie";

export function setGameAccess(roomId: string) {
  Cookies.set("hasGameAccess", roomId, { expires: 1 }); // expire 1 hari
}
