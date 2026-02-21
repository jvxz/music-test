type Command = typeof commands[keyof typeof commands]

function isResult<T, E>(res: unknown): res is Result<T, E> {
  return res != null && typeof res === 'object' && 'status' in res
}

type UnwrapResult<T> = T extends Promise<Result<infer U, any>> ? U : Awaited<T>

export async function $invoke<T extends Command>(cmd: T, ...args: Parameters<T>): Promise<UnwrapResult<ReturnType<T>>> {
  const returnValue = await (cmd as (...a: any[]) => any)(...(args as any[])) as Awaited<ReturnType<T>>
  const res = isResult(returnValue)

  if (!res)
    return returnValue as UnwrapResult<ReturnType<T>>

  if (returnValue.status === 'error')
    throw emitError(returnValue.error)

  return returnValue.data as UnwrapResult<ReturnType<T>>
}

$invoke(commands.getCanonicalPath, 'test')
