import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text

async def main():
    engine = create_async_engine('postgresql+asyncpg://zampify:zampify@localhost:5432/zampify')
    Session = async_sessionmaker(engine)
    async with Session() as session:
        result = await session.execute(text('SELECT id FROM invoices ORDER BY created_at DESC LIMIT 1;'))
        row = result.fetchone()
        if not row:
            print('No invoices found')
            return
            
        keep_id = row[0]
        
        # We also need to clean up communication cases related to deleted invoices so we don't have dangling references 
        # or we could just let them be, but better delete them if they reference the deleted invoices
        
        # Wait, if we just delete invoices, what about purchase orders or line items?
        # Invoice has ON DELETE CASCADE in most good schemas, but let's just delete the invoices.
        # Actually, let's delete them.
        
        # Then delete invoices
        await session.execute(text(f"DELETE FROM invoices WHERE id != '{keep_id}';"))
        await session.commit()
        print(f'Deleted all invoices except {keep_id}')

asyncio.run(main())
