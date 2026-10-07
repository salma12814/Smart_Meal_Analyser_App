package com.smeal.util;
import org.springframework.data.domain.*;
import org.springframework.util.Assert;

public record OffsetPageRequest(long offset, int pageSize, Sort sort) implements Pageable {
    public OffsetPageRequest(long offset, int pageSize) { this(offset, pageSize, Sort.unsorted()); }
    public OffsetPageRequest {
        Assert.isTrue(offset >= 0, "Offset must not be negative");
        Assert.isTrue(pageSize > 0, "Page size must be greater than zero");
        sort = sort == null ? Sort.unsorted() : sort;
    }
    @Override public int getPageNumber() { return Math.toIntExact(offset / pageSize); }
    @Override public int getPageSize() { return pageSize; }
    @Override public long getOffset() { return offset; }
    @Override public Sort getSort() { return sort; }
    @Override public Pageable next() { return new OffsetPageRequest(offset + pageSize, pageSize, sort); }
    @Override public Pageable previousOrFirst() { return hasPrevious() ? new OffsetPageRequest(Math.max(0, offset - pageSize), pageSize, sort) : first(); }
    @Override public Pageable first() { return new OffsetPageRequest(0, pageSize, sort); }
    @Override public Pageable withPage(int pageNumber) { Assert.isTrue(pageNumber >= 0, "Page index must not be negative"); return new OffsetPageRequest((long) pageNumber * pageSize, pageSize, sort); }
    @Override public boolean hasPrevious() { return offset > 0; }
}
