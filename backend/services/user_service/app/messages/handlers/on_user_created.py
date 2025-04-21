import json

from schemas.user import UserCreatedEventSchema
from db.session import SessionLocal
from crud.user import create_user_from_event

async def handler_created_user(raw: str):
    try:
        dict_data = json.loads(raw)
        user_created_event = UserCreatedEventSchema.model_validate(dict_data)

        print(f'Recieved valid data in {handler_created_user.__name__} event : {json.dumps(user_created_event.model_dump_json, indent=4, ensure_ascii=False)}')

        with SessionLocal() as session:
            new_user = create_user_from_event(session, user_created_event)
            print(f'Successfully created new user : {new_user}')

    except Exception as e:
        print(f'Recieved invalid data in event : {e}')
        return