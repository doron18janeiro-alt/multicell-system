-- Backup incremental: registros das últimas 24h.
-- Ajuste o intervalo conforme necessário.

-- VENDAS nas últimas 24h
select * from vendas where created_at > now() - interval '24 hours';

-- OS nas últimas 24h
select * from os where data_entrada > now() - interval '24 hours';

-- PRODUTOS criados nas últimas 24h
select * from produtos where created_at > now() - interval '24 hours';

-- CLIENTES nas últimas 24h
select * from clientes where created_at > now() - interval '24 hours';

-- USUARIOS nas últimas 24h
select * from usuarios where criado_em > now() - interval '24 hours';
