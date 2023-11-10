import { CollectionConfig } from 'payload/types'

const Exports: CollectionConfig = {
  slug: 'exports',
  admin: {
    useAsTitle: 'createdAt',
  },
  hooks: {
    afterOperation: [async ({ args, operation, result }) => {
      if (operation === 'create') {
        let buffer: Buffer = Buffer.from('{ users: [', 'utf-8')
        const users = await args.req.payload.find({
          collection: 'users',
          req: args.req,
        })

        users.docs.forEach((user) => {
          buffer = Buffer.concat([buffer, Buffer.from(JSON.stringify(user), 'utf-8')])
        })

        buffer = Buffer.concat([buffer, Buffer.from(']}', 'utf-8')])

        args.req.payload.create({
          collection: 'backup',
          req: args.req,
          file: { data: buffer, name: 'test.json', mimetype: 'application/json', size: buffer.byteLength },
          data: {}
        }).then((backup) => {
          args.req.payload.update({
            collection: 'exports',
            id: result.id,
            req: args.req,
            data: {
              file: backup.id,
            },
          })
        })

        // update this created export with the relationship to the file

        return result
      }
    }]
  },
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'backup',
    },
    {
      name: 'options',
      type: 'json',
    },
  ],
}

export default Exports
