require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get root_url
    assert_response :success
  end

  test "should get index with Japanese locale" do
    get root_url(locale: :ja)
    assert_response :success
  end

  test "should get organizer" do
    get organizer_url
    assert_response :success
  end

  test "should get organizer with Japanese locale" do
    get organizer_url(locale: :ja)
    assert_response :success
  end

  test "should get organizer checklist" do
    get organizer_checklist_url
    assert_response :success
  end

  test "should get stamp samples" do
    get stamp_samples_url
    assert_response :success
  end

  test "should reject unsupported locale" do
    get "/fr/"
    assert_response :not_found
  end

  test "auth routes work without locale prefix" do
    get "/session/new"
    assert_response :success
  end
end
