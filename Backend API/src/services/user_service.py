from datetime import datetime
from database.Database import Database
import services.user_service as user_service
from model.User import User
from fastapi import HTTPException
from services.utils import checkValidParameterString

user_collection = Database().connection["usuario"]


def get_user(name: str) -> User:
    """ Returns user with name "name"

    Parameters
    ----------
        name (str): Users's name

    Raises
    -------
        400 : Bad Request
        404 : User not found

    Returns
    -------
        User object
    """

    if not checkValidParameterString(name):
        raise HTTPException(status_code=400, detail="Parámetros no válidos")

    user_data = user_collection.find_one({'name': name})

    if user_data is None:
        raise HTTPException(
            status_code=404, detail="El usuario con ese nombre no existe")

    date = user_data["register_date"][:-1]

    user = User(name=user_data["name"], photo=user_data["photo"], register_date=date, password=user_data["password"],
                playback_history=user_data["playback_history"], playlists=user_data["playlists"], saved_playlists=user_data["saved_playlists"])

    return user


def create_user(name: str, photo: str, password: str) -> None:
    """ Creates a user

    Parameters
    ----------
        name (str): Users's name
        photo (str): Url of users thumbnail
        password (str) : Password of users account

    Raises
    -------
        400 : Bad Request

    Returns
    -------
    """

    current_date = datetime.now()
    date_iso8601 = current_date.strftime('%Y-%m-%dT%H:%M:%S')

    if not checkValidParameterString(name):
        raise HTTPException(status_code=400, detail="Parámetros no válidos")

    result_user_exists = user_collection.find_one({'name': name})

    if result_user_exists:
        raise HTTPException(status_code=400, detail="La playlist ya existe")

    result = user_collection.insert_one(
        {'name': name, 'photo': photo if 'http' in photo else '', 'register_date': date_iso8601, 'password': password,'saved_playlists': [], 'playlists': [], 'playback_history': []})

    return True if result.acknowledged else False


def update_user(name: str, photo: str, playlists:list,saved_playlists:list,playback_history:list) -> None:
    """ Updates a user , duplicated playlists and songs wont be added

    Parameters
    ----------
        name (str): Users's name
        photo (str): Url of user thumbnail
        playlists (list) : users playlists
        playlists (list) : others users playlists saved by user with name "name"
        playback_history (list) : song names of playback history of the user


    Raises
    -------
        400 : Bad Request
        404 : User Not Found

    Returns
    -------
    """

    if not checkValidParameterString(name):
        raise HTTPException(status_code=400, detail="Parámetros no válidos")

    result_user_exists = user_collection.find_one({'name': name})

    if not result_user_exists:
        raise HTTPException(status_code=404, detail="El usuario no existe")

    result = user_collection.update_one( {'name': name} ,
        { "$set": {'photo': photo if 'http' in photo else '','saved_playlists': list(set(saved_playlists)), 'playlists': list(set(playlists)), 'playback_history': list(set(playback_history))} })


def delete_user(name: str) -> None:
    """ Deletes a user by name

    Parameters
    ----------
        name (str): Users's name

    Raises
    -------
        400 : Bad Request
        404 : User Not Found

    Returns
    -------
    """

    if not checkValidParameterString(name):
        raise HTTPException(status_code=400, detail="Parámetros no válidos")

    result = user_collection.delete_one({'name': name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="El usuario no existe")
