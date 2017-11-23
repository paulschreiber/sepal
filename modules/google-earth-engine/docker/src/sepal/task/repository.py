import importlib

_task_by_id = {}


def submit(id, module, spec, context):
    factory = importlib.import_module(name=module)
    task = factory.create(spec, context)
    _task_by_id[id] = task
    task.submit().catch(_re_raise)


def status(id):
    task = _get_task(id)
    state, message = task.state, task.status_message()
    return {'state': state, 'message': message}


def cancel(id):
    _get_task(id).cancel()


def close():
    for id in _task_by_id:
        _task_by_id[id].cancel()


def _re_raise(exception):
    print(type(exception))
    exception.re_raise()
    print(exception)


def _get_task(id):
    return _task_by_id[id]
